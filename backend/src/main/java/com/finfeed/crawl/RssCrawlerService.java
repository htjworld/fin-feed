package com.finfeed.crawl;

import com.finfeed.article.Article;
import com.finfeed.article.ArticleRepository;
import com.finfeed.company.Company;
import com.finfeed.company.CompanyRepository;
import com.rometools.rome.feed.synd.SyndContent;
import com.rometools.rome.feed.synd.SyndEnclosure;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
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

        Article article = Article.builder()
                .company(company)
                .title(sanitize(entry.getTitle()))
                .url(url)
                .summary(extractSummary(entry))
                .thumbnailUrl(extractThumbnail(entry))
                .publishedAt(toLocalDateTime(entry))
                .build();

        articleRepository.save(article);
        return true;
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
