package com.finfeed.crawl;

import com.finfeed.article.Article;
import com.finfeed.article.ArticleRepository;
import com.finfeed.company.Company;
import com.finfeed.company.CompanyRepository;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Service
public class TossBackfillService {

    private static final Logger log = LoggerFactory.getLogger(TossBackfillService.class);
    private static final String TOSS_HOME = "https://toss.tech";
    private static final String USER_AGENT =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    private static final int MAX_PAGES = 30;
    private static final int TIMEOUT_MS = 15_000;

    private final ArticleRepository articleRepository;
    private final CompanyRepository companyRepository;
    private final CrawlLogRepository crawlLogRepository;

    public TossBackfillService(ArticleRepository articleRepository,
                               CompanyRepository companyRepository,
                               CrawlLogRepository crawlLogRepository) {
        this.articleRepository = articleRepository;
        this.companyRepository = companyRepository;
        this.crawlLogRepository = crawlLogRepository;
    }

    @Transactional
    public int backfill() {
        Company toss = companyRepository.findByNameEn("Toss").orElse(null);
        if (toss == null) {
            log.warn("Toss company not found");
            return 0;
        }
        CrawlLog crawlLog = CrawlLog.start(toss);
        try {
            Set<String> urls = collectArticleUrls();
            log.info("[Toss backfill] 수집된 아티클 URL: {}개", urls.size());

            int added = 0;
            for (String url : urls) {
                if (articleRepository.existsByUrl(url)) continue;
                ArticleInfo info = fetchArticleInfo(url);
                if (info == null) continue;
                saveArticle(toss, info);
                added++;
                if (added % 10 == 0) log.info("[Toss backfill] {}개 저장 완료...", added);
            }

            log.info("[Toss backfill] 완료: {}개 신규 저장", added);
            crawlLog.succeed(added);
            crawlLogRepository.save(crawlLog);
            return added;
        } catch (Exception e) {
            log.error("[Toss backfill] 실패: {}", e.getMessage());
            crawlLog.fail(e.getMessage());
            crawlLogRepository.save(crawlLog);
            return 0;
        }
    }

    private Set<String> collectArticleUrls() {
        Set<String> urls = new LinkedHashSet<>();

        for (int page = 1; page <= MAX_PAGES; page++) {
            String pageUrl = page == 1 ? TOSS_HOME : TOSS_HOME + "?page=" + page;
            Set<String> found = fetchArticleUrlsFromPage(pageUrl);

            if (found.isEmpty()) {
                log.info("[Toss backfill] page {} — 아티클 없음, 종료", page);
                break;
            }

            int before = urls.size();
            urls.addAll(found);
            int added = urls.size() - before;

            log.info("[Toss backfill] page {} — {} URLs 발견 (신규 {}개)", page, found.size(), added);

            // No new URLs found on this page means pagination exhausted
            if (added == 0 && page > 1) break;
        }

        return urls;
    }

    private Set<String> fetchArticleUrlsFromPage(String pageUrl) {
        Set<String> urls = new LinkedHashSet<>();
        try {
            Document doc = Jsoup.connect(pageUrl)
                    .userAgent(USER_AGENT)
                    .header("Accept-Language", "ko-KR,ko;q=0.9,en;q=0.8")
                    .timeout(TIMEOUT_MS)
                    .followRedirects(true)
                    .get();

            for (Element a : doc.select("a[href]")) {
                String href = a.attr("abs:href");
                if (href.contains("toss.tech/article/") && !href.contains("#")) {
                    // Normalize: remove query params / hash
                    int q = href.indexOf('?');
                    if (q > 0) href = href.substring(0, q);
                    urls.add(href);
                }
            }
        } catch (Exception e) {
            log.warn("[Toss backfill] {} 페이지 fetch 실패: {}", pageUrl, e.getMessage());
        }
        return urls;
    }

    private ArticleInfo fetchArticleInfo(String url) {
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent(USER_AGENT)
                    .header("Accept-Language", "ko-KR,ko;q=0.9,en;q=0.8")
                    .timeout(TIMEOUT_MS)
                    .followRedirects(true)
                    .get();

            String title = metaContent(doc, "og:title");
            if (title == null || title.isBlank()) title = doc.title();
            title = stripSuffix(title, " | Toss Tech Blog", " | 토스테크블로그", " | Toss");

            String summary = metaContent(doc, "og:description");
            if (summary == null) summary = metaContent(doc, "description");
            String image = metaContent(doc, "og:image");

            LocalDateTime publishedAt = parsePublishedAt(doc);

            return new ArticleInfo(url, title, summary, image, publishedAt, new String[0]);
        } catch (Exception e) {
            log.warn("[Toss backfill] {} 아티클 fetch 실패: {}", url, e.getMessage());
            return null;
        }
    }

    private String metaContent(Document doc, String property) {
        Element el = doc.selectFirst("meta[property=" + property + "]");
        if (el == null) el = doc.selectFirst("meta[name=" + property + "]");
        if (el == null) return null;
        String content = el.attr("content");
        return content.isBlank() ? null : content;
    }

    private LocalDateTime parsePublishedAt(Document doc) {
        String published = metaContent(doc, "article:published_time");
        if (published == null) published = metaContent(doc, "og:article:published_time");
        if (published != null) {
            try {
                return OffsetDateTime.parse(published).toLocalDateTime();
            } catch (Exception ignored) {}
            try {
                return LocalDateTime.parse(published.replace("Z", ""));
            } catch (Exception ignored) {}
        }
        return LocalDateTime.now();
    }

    private String stripSuffix(String title, String... suffixes) {
        if (title == null) return null;
        for (String suffix : suffixes) {
            if (title.endsWith(suffix)) return title.substring(0, title.length() - suffix.length()).trim();
        }
        return title;
    }

    private void saveArticle(Company company, ArticleInfo info) {
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
    }
}
