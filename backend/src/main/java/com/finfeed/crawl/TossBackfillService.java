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
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TossBackfillService {

    private static final Logger log = LoggerFactory.getLogger(TossBackfillService.class);
    private static final String TOSS_HOME = "https://toss.tech";
    private static final String USER_AGENT =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    private static final int MAX_PAGES = 30;
    private static final int TIMEOUT_MS = 15_000;

    private static final String BACKFILL_KEY = "toss";

    // ISO-8601 datetime (offset/Z optional) — toss.tech __next_f 페이로드의 publishedTime 매칭용
    private static final String ISO =
            "[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\\.[0-9]+)?(?:[+-][0-9]{2}:[0-9]{2}|Z)?";
    private static final Pattern PUBLISHED_TIME =
            Pattern.compile("(?<![a-zA-Z])publishedTime\\W{1,8}(" + ISO + ")");

    private final ArticleRepository articleRepository;
    private final CompanyRepository companyRepository;
    private final CrawlLogRepository crawlLogRepository;
    private final BackfillLogRepository backfillLogRepository;

    public TossBackfillService(ArticleRepository articleRepository,
                               CompanyRepository companyRepository,
                               CrawlLogRepository crawlLogRepository,
                               BackfillLogRepository backfillLogRepository) {
        this.articleRepository = articleRepository;
        this.companyRepository = companyRepository;
        this.crawlLogRepository = crawlLogRepository;
        this.backfillLogRepository = backfillLogRepository;
    }

    @Transactional
    public int backfill() {
        // 이미 완료된 백필이면 스킵
        if (backfillLogRepository.existsById(BACKFILL_KEY)) {
            log.info("[Toss backfill] 이미 완료됨 (backfill_log 확인), 스킵. 재실행하려면 DELETE FROM backfill_log WHERE name = 'toss'");
            return 0;
        }

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
            // 완료 기록 — 다음 호출 시 중복 실행 방지
            backfillLogRepository.save(new BackfillLog(BACKFILL_KEY, LocalDateTime.now(), added));
            return added;
        } catch (Exception e) {
            log.error("[Toss backfill] 실패: {}", e.getMessage());
            crawlLog.fail(e.getMessage());
            crawlLogRepository.save(crawlLog);
            return 0;
        }
    }

    /**
     * 기존 토스 글의 발행일을 실제 발행일로 보정한다.
     * 과거 백필이 publishedTime을 못 읽어 수집 시각(now)으로 박아둔 글들을 re-fetch해서 UPDATE.
     * articles 캐시를 비워 최신순 정렬이 즉시 반영되게 함.
     */
    @CacheEvict(cacheNames = "articles", allEntries = true)
    @Transactional
    public int repairDates() {
        Company toss = companyRepository.findByNameEn("Toss").orElse(null);
        if (toss == null) {
            log.warn("Toss company not found");
            return 0;
        }
        List<Article> articles = articleRepository.findByCompanyId(toss.getId());
        log.info("[Toss repair] 대상 {}개 글 발행일 점검 시작", articles.size());

        int fixed = 0;
        for (Article article : articles) {
            try {
                Document doc = Jsoup.connect(article.getUrl())
                        .userAgent(USER_AGENT)
                        .header("Accept-Language", "ko-KR,ko;q=0.9,en;q=0.8")
                        .timeout(TIMEOUT_MS)
                        .followRedirects(true)
                        .get();
                LocalDateTime real = parsePublishedTimeFromScripts(scriptText(doc), slugOf(article.getUrl()));
                if (real != null && !real.equals(article.getPublishedAt())) {
                    log.info("[Toss repair] {} : {} → {}", slugOf(article.getUrl()), article.getPublishedAt(), real);
                    article.setPublishedAt(real); // 영속 엔티티 — 트랜잭션 종료 시 dirty checking으로 UPDATE
                    fixed++;
                }
            } catch (Exception e) {
                log.warn("[Toss repair] {} 보정 실패: {}", article.getUrl(), e.getMessage());
            }
        }
        log.info("[Toss repair] 완료: {}개 발행일 수정", fixed);
        return fixed;
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

            LocalDateTime publishedAt = parsePublishedAt(doc, url);

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

    private LocalDateTime parsePublishedAt(Document doc, String url) {
        // 1) 표준 메타 태그 (toss.tech에는 거의 없지만 저렴하니 먼저 시도)
        String published = metaContent(doc, "article:published_time");
        if (published == null) published = metaContent(doc, "og:article:published_time");
        LocalDateTime fromMeta = parseIso(published);
        if (fromMeta != null) return fromMeta;

        // 2) Next.js App Router의 __next_f 페이로드 — toss.tech 실제 발행일이 여기에 있음
        LocalDateTime fromScripts = parsePublishedTimeFromScripts(scriptText(doc), slugOf(url));
        if (fromScripts != null) return fromScripts;

        // 3) 최후 폴백: 수집 시각 (위 파싱이 정상 동작하면 거의 도달하지 않음)
        return LocalDateTime.now();
    }

    /** toss.tech 글 페이지의 __next_f 스트리밍 페이로드에서 해당 글(slug)의 publishedTime을 추출 */
    private LocalDateTime parsePublishedTimeFromScripts(String scripts, String slug) {
        if (scripts == null || slug == null || slug.isBlank()) return null;
        // 글 자신의 key("slug")에 앵커를 걸어, 관련글 등 다른 객체의 날짜와 섞이지 않게 함
        Matcher key = Pattern.compile("key\\W{1,8}" + Pattern.quote(slug) + "\\b").matcher(scripts);
        while (key.find()) {
            int from = key.end();
            String window = scripts.substring(from, Math.min(from + 1500, scripts.length()));
            Matcher pm = PUBLISHED_TIME.matcher(window);
            if (pm.find()) {
                LocalDateTime dt = parseIso(pm.group(1));
                if (dt != null) return dt;
            }
        }
        return null;
    }

    private String scriptText(Document doc) {
        StringBuilder sb = new StringBuilder();
        for (Element s : doc.select("script")) sb.append(s.data()).append('\n');
        return sb.toString();
    }

    private String slugOf(String url) {
        if (url == null || url.isBlank()) return null;
        String s = url;
        int q = s.indexOf('?'); if (q >= 0) s = s.substring(0, q);
        int h = s.indexOf('#'); if (h >= 0) s = s.substring(0, h);
        s = s.replaceAll("/+$", "");
        int slash = s.lastIndexOf('/');
        return slash >= 0 ? s.substring(slash + 1) : s;
    }

    private LocalDateTime parseIso(String s) {
        if (s == null || s.isBlank()) return null;
        try { return OffsetDateTime.parse(s).toLocalDateTime(); } catch (Exception ignored) {}
        try { return LocalDateTime.parse(s.replace("Z", "")); } catch (Exception ignored) {}
        return null;
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
