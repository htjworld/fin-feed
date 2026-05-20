package com.finfeed.crawler.service;

import com.finfeed.crawler.domain.Article;
import com.finfeed.crawler.domain.Company;
import com.finfeed.crawler.domain.CrawlLog;
import com.finfeed.crawler.repository.ArticleRepository;
import com.finfeed.crawler.repository.CrawlLogRepository;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URLConnection;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class RssCrawlerService {

    private final ArticleRepository articleRepository;
    private final CrawlLogRepository crawlLogRepository;

    public RssCrawlerService(ArticleRepository articleRepository, CrawlLogRepository crawlLogRepository) {
        this.articleRepository = articleRepository;
        this.crawlLogRepository = crawlLogRepository;
    }

    @Transactional
    public CrawlSummary crawlCompany(Company company) {
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

    private SyndFeed fetchFeed(String url) throws Exception {
        URLConnection conn = URI.create(url).toURL().openConnection();
        conn.setConnectTimeout(10_000);
        conn.setReadTimeout(10_000);
        conn.setRequestProperty("User-Agent", "FinFeed/1.0");
        return new SyndFeedInput().build(new XmlReader(conn));
    }

    private boolean saveArticle(Company company, SyndEntry entry) {
        String url = resolveUrl(entry.getLink(), company.getSiteUrl());
        if (url == null || url.isBlank() || articleRepository.existsByUrl(url)) return false;

        String thumbnail = extractThumbnail(entry);
        if (thumbnail == null || thumbnail.isBlank()) thumbnail = fetchOgImage(url);

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

    private String resolveUrl(String url, String siteUrl) {
        if (url == null || url.isBlank()) return url;
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        String base = siteUrl == null ? "" : siteUrl.replaceAll("/+$", "");
        return url.startsWith("/") ? base + url : base + "/" + url;
    }

    private String sanitize(String text) {
        return text == null ? "" : text.replaceAll("<[^>]+>", "").trim();
    }

    private String extractSummary(SyndEntry entry) {
        SyndContent desc = entry.getDescription();
        if (desc == null) return null;
        String text = sanitize(desc.getValue());
        return text.length() > 500 ? text.substring(0, 500) : text;
    }

    private String extractThumbnail(SyndEntry entry) {
        MediaEntryModule media = (MediaEntryModule) entry.getModule(MediaEntryModule.URI);
        if (media != null) {
            for (MediaContent c : media.getMediaContents()) {
                if (c.getReference() != null) return c.getReference().toString();
            }
            if (media.getMetadata() != null) {
                Thumbnail[] thumbs = media.getMetadata().getThumbnail();
                if (thumbs.length > 0 && thumbs[0].getUrl() != null) return thumbs[0].getUrl().toString();
            }
        }
        for (SyndEnclosure enc : entry.getEnclosures()) {
            if (enc.getType() != null && enc.getType().startsWith("image/")) return enc.getUrl();
        }
        return null;
    }

    private String[] extractTags(SyndEntry entry) {
        return entry.getCategories().stream()
                .map(c -> c.getName().trim().toLowerCase())
                .filter(t -> !t.isBlank())
                .distinct().limit(5)
                .toArray(String[]::new);
    }

    private String fetchOgImage(String url) {
        if (url == null || url.isBlank()) return null;
        if (url.contains("medium.com")) return fetchThumbnailViaJina(url);
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .timeout(10_000)
                    .followRedirects(true)
                    .get();
            Element og = doc.selectFirst("meta[property=og:image]");
            if (og != null) {
                String img = resolveImageUrl(og.attr("content"), url);
                if (isUsableImage(img)) return img;
            }
            Element tw = doc.selectFirst("meta[name=twitter:image]");
            if (tw != null) {
                String img = resolveImageUrl(tw.attr("content"), url);
                if (isUsableImage(img)) return img;
            }
            Elements imgs = doc.select("article img, main img, .post img, .content img");
            for (Element img : imgs) {
                String src = img.absUrl("src");
                if (isUsableImage(src)) return src;
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
            java.util.regex.Matcher m = java.util.regex.Pattern
                    .compile("https://miro\\.medium\\.com/v2/resize:fit:[^\\s)]+")
                    .matcher(body);
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
            java.net.URI base = java.net.URI.create(pageUrl);
            return base.getScheme() + "://" + base.getHost() + (imageUrl.startsWith("/") ? imageUrl : "/" + imageUrl);
        } catch (Exception ignored) { return imageUrl; }
    }

    private boolean isUsableImage(String url) {
        if (url == null || url.isBlank() || !url.startsWith("http")) return false;
        String lower = url.toLowerCase();
        return !lower.contains("logo") && !lower.contains("icon") && !lower.contains("og_gray") && !lower.contains("placeholder");
    }

    private LocalDateTime toLocalDateTime(SyndEntry entry) {
        if (entry.getPublishedDate() != null)
            return entry.getPublishedDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
        if (entry.getUpdatedDate() != null)
            return entry.getUpdatedDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
        return LocalDateTime.now();
    }
}
