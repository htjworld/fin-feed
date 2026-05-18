package com.finfeed.crawl;

import com.finfeed.article.Article;
import com.finfeed.article.ArticleRepository;
import com.finfeed.company.Company;
import com.finfeed.company.CompanyRepository;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URLConnection;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class RssCrawlerService {

    private final CompanyRepository companyRepository;
    private final ArticleRepository articleRepository;
    private final CrawlLogRepository crawlLogRepository;

    @Value("${crawler.connection-timeout-ms:10000}")
    private int connectionTimeoutMs;

    @Value("${crawler.read-timeout-ms:10000}")
    private int readTimeoutMs;

    public RssCrawlerService(CompanyRepository companyRepository,
                             ArticleRepository articleRepository,
                             CrawlLogRepository crawlLogRepository) {
        this.companyRepository = companyRepository;
        this.articleRepository = articleRepository;
        this.crawlLogRepository = crawlLogRepository;
    }

    @Transactional
    public CrawlSummary crawlAll() {
        List<Company> companies = companyRepository.findByActiveTrueAndRssUrlNotNull();
        return companies.stream()
                .map(this::crawlCompany)
                .reduce(CrawlSummary.ZERO, CrawlSummary::merge);
    }

    @Transactional
    public CrawlSummary crawlCompany(Company company) {
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
        String url = entry.getLink();
        if (url == null || url.isBlank() || articleRepository.existsByUrl(url)) return false;

        String thumbnail = extractThumbnail(entry);
        if (thumbnail == null || thumbnail.isBlank()) {
            thumbnail = fetchThumbnailFromHtml(url);
        }

        Article article = Article.builder()
                .company(company)
                .title(sanitize(entry.getTitle()))
                .url(url)
                .summary(extractSummary(entry))
                .thumbnailUrl(thumbnail)
                .publishedAt(toLocalDateTime(entry))
                .tags(extractTags(entry))
                .build();

        articleRepository.save(article);
        return true;
    }

    private String[] extractTags(SyndEntry entry) {
        return entry.getCategories().stream()
                .map(cat -> cat.getName())
                .filter(name -> name != null && !name.isBlank())
                .map(name -> name.trim().toLowerCase())
                .distinct()
                .limit(5)
                .toArray(String[]::new);
    }

    private String sanitize(String text) {
        if (text == null) return "";
        return text.replaceAll("<[^>]+>", "").trim();
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
                if (content.getReference() != null) {
                    return content.getReference().toString();
                }
            }
            if (media.getMetadata() != null) {
                Thumbnail[] thumbnails = media.getMetadata().getThumbnail();
                if (thumbnails.length > 0 && thumbnails[0].getUrl() != null) {
                    return thumbnails[0].getUrl().toString();
                }
            }
        }
        for (SyndEnclosure enc : entry.getEnclosures()) {
            if (enc.getType() != null && enc.getType().startsWith("image/")) {
                return enc.getUrl();
            }
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
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .timeout(5000)
                    .followRedirects(true)
                    .get();

            // 1. og:image
            Element ogImage = doc.selectFirst("meta[property=og:image]");
            if (ogImage != null) {
                String content = ogImage.attr("content");
                if (content != null && !content.isBlank()) {
                    return content.trim();
                }
            }

            // 2. twitter:image
            Element twitterImage = doc.selectFirst("meta[name=twitter:image]");
            if (twitterImage != null) {
                String content = twitterImage.attr("content");
                if (content != null && !content.isBlank()) {
                    return content.trim();
                }
            }

            // 3. Fallback: First high-quality image in the post body
            Elements imgs = doc.select("article img, main img, .post img, .content img");
            for (Element img : imgs) {
                String src = img.absUrl("src");
                if (src != null && !src.isBlank() && !src.contains("logo") && !src.contains("icon")) {
                    return src;
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch thumbnail from HTML for " + url + ": " + e.getMessage());
        }
        return null;
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

    public record CrawlSummary(int articlesAdded, int failures) {
        static final CrawlSummary ZERO = new CrawlSummary(0, 0);

        CrawlSummary merge(CrawlSummary other) {
            return new CrawlSummary(
                    this.articlesAdded + other.articlesAdded,
                    this.failures + other.failures
            );
        }
    }
}
