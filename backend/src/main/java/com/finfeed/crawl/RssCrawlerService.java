package com.finfeed.crawl;

import com.finfeed.article.Article;
import com.finfeed.article.ArticleRepository;
import com.finfeed.company.Company;
import com.rometools.modules.mediarss.MediaEntryModule;
import com.rometools.modules.mediarss.types.MediaContent;
import com.rometools.modules.mediarss.types.Thumbnail;
import com.rometools.rome.feed.synd.SyndContent;
import com.rometools.rome.feed.synd.SyndEnclosure;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URLConnection;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.LinkedHashSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class RssCrawlerService implements BlogCrawler {

    private static final Logger log = LoggerFactory.getLogger(RssCrawlerService.class);

    private final ArticleRepository articleRepository;
    private final CrawlLogRepository crawlLogRepository;

    @Value("${crawler.connection-timeout-ms:10000}")
    private int connectionTimeoutMs;

    @Value("${crawler.read-timeout-ms:10000}")
    private int readTimeoutMs;

    public RssCrawlerService(ArticleRepository articleRepository,
                             CrawlLogRepository crawlLogRepository) {
        this.articleRepository = articleRepository;
        this.crawlLogRepository = crawlLogRepository;
    }

    @Override
    public boolean supports(CrawlType type) {
        return type == CrawlType.RSS;
    }

    @Override
    @Transactional
    public CrawlSummary crawl(Company company) {
        if (company.getRssUrl() == null) return CrawlSummary.ZERO;
        CrawlLog log = CrawlLog.start(company);
        try {
            SyndFeed feed = fetchFeed(company.getRssUrl());
            int added = 0;
            for (SyndEntry entry : feed.getEntries()) {
                if (saveArticle(company, entry)) added++;
            }
            log.succeed(added);
            crawlLogRepository.save(log);
            return new CrawlSummary(added, 0);
        } catch (Exception e) {
            log.fail(e.getMessage());
            crawlLogRepository.save(log);
            return new CrawlSummary(0, 1);
        }
    }

    private SyndFeed fetchFeed(String rssUrl) throws Exception {
        URLConnection connection = URI.create(rssUrl).toURL().openConnection();
        connection.setConnectTimeout(connectionTimeoutMs);
        connection.setReadTimeout(readTimeoutMs);
        connection.setRequestProperty("User-Agent", "FinFeed/1.0 (+https://finfeed.vercel.app)");
        return new SyndFeedInput().build(new XmlReader(connection));
    }

    private boolean saveArticle(Company company, SyndEntry entry) {
        String url = resolveUrl(entry.getLink(), company.getSiteUrl());
        if (url == null || url.isBlank() || articleRepository.existsByUrl(url)) return false;

        // 같은 회사에 동일 제목 아티클이 이미 있으면 스킵 (EN/KO 이중 게시 방지)
        String title = sanitize(entry.getTitle());
        if (!title.isBlank() && articleRepository.existsByCompanyIdAndTitle(company.getId(), title)) return false;

        String thumbnail = extractThumbnail(entry);
        if (thumbnail == null || thumbnail.isBlank()) {
            thumbnail = fetchThumbnailFromHtml(url);
        }
        if (isVolatileThumbnail(thumbnail)) {
            log.debug("휘발성 썸네일 URL 스킵: {}", thumbnail);
            thumbnail = null;
        }

        Article article = Article.builder()
                .company(company)
                .title(title)
                .url(url)
                .summary(extractSummary(entry))
                .thumbnailUrl(thumbnail)
                .publishedAt(toLocalDateTime(entry))
                .tags(extractTags(entry))
                .build();

        articleRepository.save(article);
        return true;
    }

    private static final Map<String, String[]> TAG_KEYWORDS = Map.of(
        "payment",    new String[]{"결제","송금","payment","pg","간편결제","이체","정산","환불","청구"},
        "security",   new String[]{"보안","security","인증","auth","암호","취약점","fraud","사기","zero-trust"},
        "mydata",     new String[]{"마이데이터","mydata","오픈뱅킹","openbanking","계좌연동"},
        "blockchain", new String[]{"블록체인","blockchain","defi","web3","스마트컨트랙트","nft","token","합의"},
        "infra",      new String[]{"인프라","infra","kubernetes","k8s","docker","devops","ci/cd","배포","kafka","redis","aws","gcp","azure"},
        "backend",    new String[]{"백엔드","backend","api","spring","java","python","node","rest","graphql","grpc","msa","마이크로서비스"},
        "ai",         new String[]{"ai","ml","머신러닝","딥러닝","llm","gpt","추천","모델","임베딩","rag","챗봇"},
        "data",       new String[]{"데이터","database","sql","postgresql","분석","analytics","spark","flink","파이프라인","warehouse"},
        "mobile",     new String[]{"모바일","mobile","ios","android","flutter","swift","kotlin"},
        "trading",    new String[]{"트레이딩","trading","hts","mts","매칭","시세","호가","주문","체결"}
    );

    private String[] extractTags(SyndEntry entry) {
        Set<String> tags = new LinkedHashSet<>();
        entry.getCategories().stream()
                .filter(cat -> cat.getName() != null && !cat.getName().isBlank())
                .map(cat -> cat.getName().trim().toLowerCase())
                .forEach(tags::add);

        String text = ((entry.getTitle() == null ? "" : entry.getTitle()) + " " +
                       (entry.getDescription() == null ? "" : entry.getDescription().getValue())).toLowerCase();
        TAG_KEYWORDS.forEach((tag, keywords) -> {
            for (String kw : keywords) {
                if (text.contains(kw)) { tags.add(tag); break; }
            }
        });
        return tags.stream().limit(5).toArray(String[]::new);
    }

    private String resolveUrl(String url, String siteUrl) {
        if (url == null || url.isBlank()) return url;
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        String base = siteUrl == null ? "" : siteUrl.replaceAll("/+$", "");
        return url.startsWith("/") ? base + url : base + "/" + url;
    }

    private String sanitize(String text) {
        if (text == null) return "";
        return Jsoup.parse(text).text().trim();
    }

    private String extractSummary(SyndEntry entry) {
        SyndContent description = entry.getDescription();
        if (description == null) return null;
        String text = sanitize(description.getValue());
        return text.length() > 500 ? text.substring(0, 500) : text;
    }

    private String extractThumbnail(SyndEntry entry) {
        MediaEntryModule media = (MediaEntryModule) entry.getModule(MediaEntryModule.URI);
        if (media != null) {
            for (MediaContent content : media.getMediaContents()) {
                if (content.getReference() != null) return content.getReference().toString();
            }
            if (media.getMetadata() != null) {
                Thumbnail[] thumbnails = media.getMetadata().getThumbnail();
                if (thumbnails.length > 0 && thumbnails[0].getUrl() != null) {
                    return thumbnails[0].getUrl().toString();
                }
            }
        }
        for (SyndEnclosure enc : entry.getEnclosures()) {
            if (enc.getType() != null && enc.getType().startsWith("image/")) return enc.getUrl();
        }
        return null;
    }

    private LocalDateTime toLocalDateTime(SyndEntry entry) {
        if (entry.getPublishedDate() != null) {
            return entry.getPublishedDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
        }
        if (entry.getUpdatedDate() != null) {
            return entry.getUpdatedDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
        }
        return LocalDateTime.now();
    }

    private String fetchThumbnailFromHtml(String url) {
        if (url == null || url.isBlank()) return null;
        if (url.contains("medium.com")) return fetchThumbnailViaJina(url);
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(10_000)
                    .followRedirects(true)
                    .get();

            Element ogImage = doc.selectFirst("meta[property=og:image]");
            if (ogImage != null) {
                String content = resolveImageUrl(ogImage.attr("content"), url);
                if (isUsableImage(content)) return content;
            }
            Element twitterImage = doc.selectFirst("meta[name=twitter:image]");
            if (twitterImage != null) {
                String content = resolveImageUrl(twitterImage.attr("content"), url);
                if (isUsableImage(content)) return content;
            }
            Elements imgs = doc.select("article img, main img, .post img, .content img");
            for (Element img : imgs) {
                String src = img.absUrl("src");
                if (isUsableImage(src)) return src;
            }
            Element firstImg = doc.selectFirst("img");
            if (firstImg != null) {
                String src = firstImg.absUrl("src");
                if (src.startsWith("http")) return src;
            }
        } catch (Exception ignored) {}
        return null;
    }

    private String fetchThumbnailViaJina(String url) {
        try {
            String cleanUrl = url.contains("?source=rss") ? url.substring(0, url.indexOf("?source=rss")) : url;
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection)
                    new java.net.URL("https://r.jina.ai/" + cleanUrl).openConnection();
            conn.setRequestProperty("User-Agent", "FinFeed/1.0");
            conn.setRequestProperty("Accept", "text/plain");
            conn.setConnectTimeout(10_000);
            conn.setReadTimeout(20_000);
            String body = new String(conn.getInputStream().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
            Matcher m = Pattern.compile("https://miro\\.medium\\.com/v2/resize:fit:[^\\s)]+").matcher(body);
            while (m.find()) {
                String img = m.group();
                if (!img.contains("32:32")) return img;
            }
        } catch (Exception ignored) {}
        return null;
    }

    private String resolveImageUrl(String imageUrl, String pageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) return null;
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
        try {
            URI base = URI.create(pageUrl);
            return base.getScheme() + "://" + base.getHost() + (imageUrl.startsWith("/") ? imageUrl : "/" + imageUrl);
        } catch (Exception ignored) { return imageUrl; }
    }

    private boolean isUsableImage(String url) {
        if (url == null || url.isBlank() || !url.startsWith("http")) return false;
        String lower = url.toLowerCase();
        return !lower.contains("logo") && !lower.contains("icon")
                && !lower.contains("og_gray") && !lower.contains("placeholder");
    }

    // Astro/_astro, Vite/assets 등 빌드 해시 기반 URL은 배포 시마다 변경되어 휘발성으로 간주
    // Vite/Astro/Next build artifact pattern: filename contains an 8+ char hash segment, e.g. thumb.CU5cbg81_uDX3M.png
    private static final Pattern VITE_HASH_FILENAME = Pattern.compile(
            ".*/[^/]+\\.[A-Za-z0-9_-]{8,}\\.(png|jpe?g|webp|gif|svg)(\\?.*)?$"
    );

    private boolean isVolatileThumbnail(String url) {
        if (url == null || url.isBlank()) return false;
        if (url.contains("/_astro/") || url.contains("/assets/") || url.contains("/_next/static/")) return true;
        return VITE_HASH_FILENAME.matcher(url).matches();
    }

    // --- Repair utilities (called directly from CrawlController) ---

    @Transactional
    public int repairMissingTags() {
        List<Article> articles = articleRepository.findAll();
        int count = 0;
        for (Article article : articles) {
            String[] existing = article.getTags();
            if (existing != null && existing.length > 0) continue;
            String text = (article.getTitle() == null ? "" : article.getTitle()) + " " +
                          (article.getSummary() == null ? "" : article.getSummary());
            String[] tags = applyKeywordTags(text.toLowerCase());
            if (tags.length > 0) {
                article.setTags(tags);
                articleRepository.save(article);
                count++;
            }
        }
        return count;
    }

    private String[] applyKeywordTags(String text) {
        Set<String> tags = new LinkedHashSet<>();
        TAG_KEYWORDS.forEach((tag, keywords) -> {
            for (String kw : keywords) {
                if (text.contains(kw)) { tags.add(tag); break; }
            }
        });
        return tags.stream().limit(5).toArray(String[]::new);
    }

    @Transactional
    public int repairMissingThumbnails() {
        List<Article> articles = articleRepository.findArticlesMissingThumbnails();
        int count = 0;
        for (Article article : articles) {
            String thumbnail = fetchThumbnailFromHtml(article.getUrl());
            if (thumbnail != null && !thumbnail.isBlank()) {
                article.setThumbnailUrl(thumbnail);
                articleRepository.save(article);
                count++;
            }
        }
        return count;
    }
}
