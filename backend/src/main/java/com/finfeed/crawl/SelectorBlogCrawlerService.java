package com.finfeed.crawl;

import com.finfeed.article.Article;
import com.finfeed.article.ArticleRepository;
import com.finfeed.company.Company;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class SelectorBlogCrawlerService implements BlogCrawler {

    private static final Logger log = LoggerFactory.getLogger(SelectorBlogCrawlerService.class);

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

    @Override
    public boolean supports(CrawlType type) {
        return type == CrawlType.CSS_SELECTOR;
    }

    @Override
    @Transactional
    public CrawlSummary crawl(Company company) {
        ParsingSelector selector = parsingSelectorRepository.findByCompanyId(company.getId()).orElse(null);
        if (selector == null) return CrawlSummary.ZERO;

        CrawlLog crawlLog = CrawlLog.start(company);
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
            crawlLog.succeed(added);
            crawlLogRepository.save(crawlLog);
            return new CrawlSummary(added, 0);
        } catch (Exception e) {
            log.error("[{}] CSS Selector 크롤링 실패 (blogUrl={}): {}",
                    company.getNameEn(), selector.getBlogUrl(), e.getMessage(), e);
            crawlLog.fail(e.getMessage());
            crawlLogRepository.save(crawlLog);
            return new CrawlSummary(0, 1);
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
            // 페이지 fetch 실패 시 빈 결과로 크롤링이 0건 "성공"처럼 보일 수 있어 반드시 기록
            log.warn("CSS Selector 페이지 fetch 실패 (url={}): {}", url, e.getMessage(), e);
            return List.of();
        }
    }

    private List<ArticleInfo> parseArticles(Document doc, ParsingSelector selector, String baseUrl) {
        Elements items = doc.select(selector.getArticleSelector());
        List<ArticleInfo> articles = new ArrayList<>();
        for (Element item : items) {
            String title = extractText(item, selector.getTitleSelector());
            String link  = extractLink(item, selector.getLinkSelector(), baseUrl);
            String thumb = extractAttr(item, selector.getThumbnailSelector(), "src", "data-src");
            if (title == null || title.isBlank() || link == null) continue;
            articles.add(new ArticleInfo(link, title, null, thumb, LocalDateTime.now(), new String[0]));
        }
        return articles;
    }

    private int crawlAdditionalPages(Company company, ParsingSelector selector) {
        int added = 0;
        int page = 2;
        int maxPages = 20;
        while (page <= maxPages) {
            String pageUrl = buildPageUrl(selector.getBlogUrl(), page);
            List<ArticleInfo> articles = crawlPage(pageUrl, selector);
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

    private String buildPageUrl(String baseUrl, int page) {
        return baseUrl.contains("?") ? baseUrl + "&page=" + page : baseUrl + "?page=" + page;
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
                log.warn("링크 절대경로 변환 실패 (href={}, baseUrl={}): {}", href, baseUrl, e.getMessage(), e);
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
