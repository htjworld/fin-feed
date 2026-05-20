package com.finfeed.crawler.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finfeed.crawler.config.WebDriverConfig;
import com.finfeed.crawler.domain.Article;
import com.finfeed.crawler.domain.Company;
import com.finfeed.crawler.domain.CrawlLog;
import com.finfeed.crawler.repository.ArticleRepository;
import com.finfeed.crawler.repository.CrawlLogRepository;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class MediumBlogCrawlerService {

    private static final Logger log = LoggerFactory.getLogger(MediumBlogCrawlerService.class);
    private static final int MAX_SCROLLS = 20;
    private final Random random = new Random();

    private final ArticleRepository articleRepository;
    private final CrawlLogRepository crawlLogRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MediumBlogCrawlerService(ArticleRepository articleRepository,
                                    CrawlLogRepository crawlLogRepository) {
        this.articleRepository = articleRepository;
        this.crawlLogRepository = crawlLogRepository;
    }

    @Transactional
    public CrawlSummary crawlCompany(Company company) {
        String blogUrl = company.getBlogUrl();
        if (blogUrl == null || blogUrl.isBlank()) return CrawlSummary.ZERO;

        CrawlLog crawlLog = CrawlLog.start(company);
        WebDriver driver = null;
        try {
            driver = WebDriverConfig.create();
            List<ArticleInfo> articles = fetchArticles(blogUrl, driver);
            int added = 0;
            for (ArticleInfo info : articles) {
                if (saveArticle(company, info)) added++;
            }
            log.info("[{}] MEDIUM_APOLLO: {} new articles", company.getNameEn(), added);
            crawlLog.succeed(added);
            crawlLogRepository.save(crawlLog);
            return new CrawlSummary(added, 0);
        } catch (Exception e) {
            log.warn("[{}] MEDIUM_APOLLO failed: {}", company.getNameEn(), e.getMessage());
            crawlLog.fail(e.getMessage());
            crawlLogRepository.save(crawlLog);
            return new CrawlSummary(0, 1);
        } finally {
            WebDriverConfig.quit(driver);
        }
    }

    private List<ArticleInfo> fetchArticles(String blogUrl, WebDriver driver) throws InterruptedException {
        String encodedUrl = encodeNonAscii(blogUrl);
        driver.get(encodedUrl);

        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})");

        Thread.sleep(3000 + random.nextInt(2000));

        List<ArticleInfo> collected = new ArrayList<>();
        int noNewCount = 0;

        for (int scroll = 0; scroll < MAX_SCROLLS; scroll++) {
            int before = collected.size();
            List<ArticleInfo> batch = parseApolloState(driver);
            for (ArticleInfo info : batch) {
                if (collected.stream().noneMatch(a -> a.url().equals(info.url()))) {
                    collected.add(info);
                }
            }
            int after = collected.size();

            if (after == before) {
                noNewCount++;
                if (scroll >= 5 && noNewCount >= 3) break;
            } else {
                noNewCount = 0;
            }

            js.executeScript("window.scrollTo(0, document.body.scrollHeight)");
            Thread.sleep(2000 + random.nextInt(1000));
        }

        return collected;
    }

    private List<ArticleInfo> parseApolloState(WebDriver driver) {
        JavascriptExecutor js = (JavascriptExecutor) driver;
        try {
            String json = (String) js.executeScript("return JSON.stringify(window.__APOLLO_STATE__ || {});");
            if (json == null || json.equals("{}")) return List.of();

            JsonNode root = objectMapper.readTree(json);
            List<ArticleInfo> articles = new ArrayList<>();

            root.fields().forEachRemaining(entry -> {
                if (!entry.getKey().startsWith("Post:")) return;
                JsonNode node = entry.getValue();

                String title = node.path("title").asText(null);
                String mediumUrl = node.path("mediumUrl").asText(null);
                if (title == null || mediumUrl == null || mediumUrl.isBlank()) return;

                String thumbnail = null;
                JsonNode previewImage = node.path("previewImage");
                if (!previewImage.isMissingNode()) {
                    String imgId = previewImage.path("id").asText(null);
                    if (imgId != null && !imgId.isBlank()) {
                        thumbnail = "https://miro.medium.com/v2/resize:fit:800/" + imgId;
                    }
                }

                String summary = node.path("previewContent").path("subtitle").asText(null);

                LocalDateTime publishedAt = LocalDateTime.now();
                long epochMs = node.path("firstPublishedAt").asLong(0);
                if (epochMs > 0) {
                    publishedAt = LocalDateTime.ofInstant(Instant.ofEpochMilli(epochMs), ZoneOffset.UTC);
                }

                articles.add(new ArticleInfo(mediumUrl, title, summary, thumbnail, publishedAt, new String[0]));
            });

            return articles;
        } catch (Exception e) {
            return List.of();
        }
    }

    private boolean saveArticle(Company company, ArticleInfo info) {
        if (info.url() == null || info.url().isBlank()) return false;
        if (articleRepository.existsByUrl(info.url())) return false;

        Article article = Article.builder()
                .company(company)
                .title(info.title() != null ? info.title() : "")
                .url(info.url())
                .summary(info.summary())
                .thumbnailUrl(info.thumbnailUrl())
                .publishedAt(info.publishedAt())
                .tags(info.tags())
                .build();
        articleRepository.save(article);
        return true;
    }

    private String encodeNonAscii(String url) {
        StringBuilder sb = new StringBuilder();
        for (char c : url.toCharArray()) {
            if (c > 127) sb.append(URLEncoder.encode(String.valueOf(c), StandardCharsets.UTF_8));
            else sb.append(c);
        }
        return sb.toString();
    }
}
