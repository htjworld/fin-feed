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

        Article article = Article.builder()
                .company(company)
                .title(sanitize(entry.getTitle()))
                .url(url)
                .summary(extractSummary(entry))
                .thumbnailUrl(extractThumbnail(entry))
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

    private LocalDateTime toLocalDateTime(SyndEntry entry) {
        if (entry.getPublishedDate() != null)
            return entry.getPublishedDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
        if (entry.getUpdatedDate() != null)
            return entry.getUpdatedDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
        return LocalDateTime.now();
    }
}
