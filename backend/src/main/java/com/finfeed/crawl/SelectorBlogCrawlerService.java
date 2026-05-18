package com.finfeed.crawl;

import com.finfeed.article.Article;
import com.finfeed.article.ArticleRepository;
import com.finfeed.company.Company;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class SelectorBlogCrawlerService {

    private static final int TIMEOUT_MS = 10_000;
    private static final String USER_AGENT =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

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
    public RssCrawlerService.CrawlSummary crawlCompany(Company company) {
        ParsingSelector selector = parsingSelectorRepository.findByCompanyId(company.getId())
                .orElse(null);
        if (selector == null) return RssCrawlerService.CrawlSummary.ZERO;

        CrawlLog log = CrawlLog.start(company);
        try {
            List<ArticleInfo> articles = crawlPage(selector.getBlogUrl(), selector);
            int added = 0;
            for (ArticleInfo info : articles) {
                if (saveArticle(company, info)) added++;
            }

            if ("NEXT_BUTTON".equals(selector.getPaginationType())
                    || "URL_PARAMETER".equals(selector.getPaginationType())) {
                added += crawlAdditionalPages(company, selector);
            }

            log.succeed(added);
            crawlLogRepository.save(log);
            return new RssCrawlerService.CrawlSummary(added, 0);
        } catch (Exception e) {
            log.fail(e.getMessage());
            crawlLogRepository.save(log);
            return new RssCrawlerService.CrawlSummary(0, 1);
        }
    }

    private List<ArticleInfo> crawlPage(String url, ParsingSelector selector) {
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent(USER_AGENT)
                    .timeout(TIMEOUT_MS)
                    .followRedirects(true)
                    .get();
            return parseArticles(doc, selector, url);
        } catch (Exception e) {
            return List.of();
        }
    }

    private List<ArticleInfo> parseArticles(Document doc, ParsingSelector selector, String baseUrl) {
        Elements items = doc.select(selector.getArticleSelector());
        List<ArticleInfo> articles = new ArrayList<>();

        for (Element item : items) {
            String title = extractText(item, selector.getTitleSelector());
            String link = extractLink(item, selector.getLinkSelector(), baseUrl);
            String thumbnail = extractAttr(item, selector.getThumbnailSelector(), "src", "data-src");
            String dateText = extractText(item, selector.getDateSelector());

            if (title == null || title.isBlank() || link == null) continue;
            articles.add(new ArticleInfo(link, title, null, thumbnail,
                    parseDate(dateText), new String[0]));
        }
        return articles;
    }

    private int crawlAdditionalPages(Company company, ParsingSelector selector) {
        int added = 0;
        int page = 2;
        int maxPages = 5;

        while (page <= maxPages) {
            String pageUrl = buildPageUrl(selector.getBlogUrl(), page);
            List<ArticleInfo> articles = crawlPage(pageUrl, selector);
            if (articles.isEmpty()) break;

            boolean anyNew = false;
            for (ArticleInfo info : articles) {
                if (saveArticle(company, info)) {
                    added++;
                    anyNew = true;
                }
            }
            if (!anyNew) break;
            page++;
        }
        return added;
    }

    private String buildPageUrl(String baseUrl, int page) {
        if (baseUrl.contains("?")) return baseUrl + "&page=" + page;
        return baseUrl + "?page=" + page;
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
                java.net.URI base = new java.net.URI(baseUrl);
                return base.getScheme() + "://" + base.getHost() + href;
            } catch (Exception e) {
                return href;
            }
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

    private LocalDateTime parseDate(String text) {
        return LocalDateTime.now();
    }

    private boolean saveArticle(Company company, ArticleInfo info) {
        if (info.url() == null || info.url().isBlank()) return false;
        if (articleRepository.existsByUrl(info.url())) return false;

        Article article = Article.builder()
                .company(company)
                .title(info.title())
                .url(info.url())
                .summary(info.summary())
                .thumbnailUrl(info.thumbnailUrl())
                .publishedAt(info.publishedAt())
                .tags(info.tags())
                .build();

        articleRepository.save(article);
        return true;
    }
}
