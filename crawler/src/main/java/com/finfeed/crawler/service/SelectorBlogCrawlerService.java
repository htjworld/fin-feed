package com.finfeed.crawler.service;

import com.finfeed.crawler.config.WebDriverConfig;
import com.finfeed.crawler.domain.Article;
import com.finfeed.crawler.domain.Company;
import com.finfeed.crawler.domain.CrawlLog;
import com.finfeed.crawler.domain.ParsingSelector;
import com.finfeed.crawler.repository.ArticleRepository;
import com.finfeed.crawler.repository.CrawlLogRepository;
import com.finfeed.crawler.repository.ParsingSelectorRepository;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class SelectorBlogCrawlerService {

    private static final Logger log = LoggerFactory.getLogger(SelectorBlogCrawlerService.class);
    private final Random random = new Random();

    private final ArticleRepository articleRepository;
    private final ParsingSelectorRepository parsingSelectorRepository;
    private final CrawlLogRepository crawlLogRepository;

    public SelectorBlogCrawlerService(ArticleRepository articleRepository,
                                      ParsingSelectorRepository parsingSelectorRepository,
                                      CrawlLogRepository crawlLogRepository) {
        this.articleRepository = articleRepository;
        this.parsingSelectorRepository = parsingSelectorRepository;
        this.crawlLogRepository = crawlLogRepository;
    }

    @Transactional
    public CrawlSummary crawlCompany(Company company) {
        ParsingSelector selector = parsingSelectorRepository.findByCompanyId(company.getId()).orElse(null);
        if (selector == null) return CrawlSummary.ZERO;

        CrawlLog crawlLog = CrawlLog.start(company);
        WebDriver driver = null;
        try {
            driver = WebDriverConfig.create();
            List<ArticleInfo> articles = crawlPage(selector.getBlogUrl(), selector, driver);
            int added = 0;
            for (ArticleInfo info : articles) {
                if (saveArticle(company, info)) added++;
            }
            if (needsPagination(selector)) {
                added += crawlAdditionalPages(company, selector, driver);
            }
            log.info("[{}] CSS_SELECTOR: {} new articles", company.getNameEn(), added);
            crawlLog.succeed(added);
            crawlLogRepository.save(crawlLog);
            return new CrawlSummary(added, 0);
        } catch (Exception e) {
            log.warn("[{}] CSS_SELECTOR failed: {}", company.getNameEn(), e.getMessage());
            crawlLog.fail(e.getMessage());
            crawlLogRepository.save(crawlLog);
            return new CrawlSummary(0, 1);
        } finally {
            WebDriverConfig.quit(driver);
        }
    }

    private List<ArticleInfo> crawlPage(String url, ParsingSelector selector, WebDriver driver)
            throws InterruptedException {
        driver.get(url);

        if ("INFINITE_SCROLL".equals(selector.getPaginationType())) {
            performInfiniteScroll(driver);
        } else {
            Thread.sleep(3000 + random.nextInt(1000));
        }

        String pageSource = driver.getPageSource();
        Document doc = Jsoup.parse(pageSource, url);
        return parseArticles(doc, selector, url);
    }

    private List<ArticleInfo> parseArticles(Document doc, ParsingSelector selector, String baseUrl) {
        Elements items = doc.select(selector.getArticleSelector());
        List<ArticleInfo> articles = new ArrayList<>();

        for (Element item : items) {
            String title = extractText(item, selector.getTitleSelector());
            String link = extractLink(item, selector.getLinkSelector(), baseUrl);
            String thumbnail = extractAttr(item, selector.getThumbnailSelector(), "src", "data-src");

            if (title == null || title.isBlank() || link == null) continue;
            articles.add(new ArticleInfo(link, title, null, thumbnail, LocalDateTime.now(), new String[0]));
        }
        return articles;
    }

    private int crawlAdditionalPages(Company company, ParsingSelector selector, WebDriver driver)
            throws InterruptedException {
        int added = 0;
        int page = 2;

        while (page <= 5) {
            String pageUrl = selector.getBlogUrl() + (selector.getBlogUrl().contains("?") ? "&" : "?") + "page=" + page;
            List<ArticleInfo> articles = crawlPage(pageUrl, selector, driver);
            if (articles.isEmpty()) break;

            boolean anyNew = false;
            for (ArticleInfo info : articles) {
                if (saveArticle(company, info)) { added++; anyNew = true; }
            }
            if (!anyNew) break;
            page++;
        }
        return added;
    }

    private void performInfiniteScroll(WebDriver driver) throws InterruptedException {
        JavascriptExecutor js = (JavascriptExecutor) driver;
        long prev = 0;
        int noChange = 0;

        for (int i = 0; i < 15; i++) {
            js.executeScript("window.scrollTo(0, document.body.scrollHeight)");
            Thread.sleep(2000 + random.nextInt(1000));
            long current = (Long) js.executeScript("return document.body.scrollHeight");
            if (current == prev) {
                noChange++;
                if (noChange >= 3) break;
            } else {
                noChange = 0;
            }
            prev = current;
        }
    }

    private boolean needsPagination(ParsingSelector selector) {
        String type = selector.getPaginationType();
        return "URL_PARAMETER".equals(type) || "NEXT_BUTTON".equals(type);
    }

    private String extractText(Element parent, String selector) {
        if (selector == null || selector.isBlank()) return null;
        Element el = parent.selectFirst(selector);
        return el != null ? el.text() : null;
    }

    private String extractLink(Element parent, String selector, String baseUrl) {
        if (selector == null || selector.isBlank()) return null;
        Element el = parent.selectFirst(selector);
        if (el == null) return null;
        String href = el.attr("abs:href");
        if (href.isBlank()) href = el.attr("href");
        if (href.isBlank()) return null;
        if (href.startsWith("/")) {
            try {
                URI base = URI.create(baseUrl);
                return base.getScheme() + "://" + base.getHost() + href;
            } catch (Exception e) { return href; }
        }
        return href;
    }

    private String extractAttr(Element parent, String selector, String... attrs) {
        if (selector == null || selector.isBlank()) return null;
        Element el = parent.selectFirst(selector);
        if (el == null) return null;
        for (String attr : attrs) {
            String val = el.attr(attr);
            if (!val.isBlank()) return val;
        }
        return null;
    }

    private boolean saveArticle(Company company, ArticleInfo info) {
        if (info.url() == null || info.url().isBlank()) return false;
        if (articleRepository.existsByUrl(info.url())) return false;
        articleRepository.save(Article.builder()
                .company(company).title(info.title()).url(info.url())
                .summary(info.summary()).thumbnailUrl(info.thumbnailUrl())
                .publishedAt(info.publishedAt()).tags(info.tags()).build());
        return true;
    }
}
