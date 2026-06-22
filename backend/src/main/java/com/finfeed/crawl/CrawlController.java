package com.finfeed.crawl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

@RestController
@RequestMapping("/api/crawl")
public class CrawlController {

    private static final Logger log = LoggerFactory.getLogger(CrawlController.class);

    // 전체 크롤링은 회사 수·페이지 수에 따라 수 분 이상 걸릴 수 있어, HTTP 요청 스레드를 막지 않고
    // 백그라운드에서 순차 실행한다 (GitHub Actions의 curl --max-time 타임아웃 방지)
    private final ExecutorService crawlExecutor = Executors.newSingleThreadExecutor();
    private final AtomicBoolean crawlInProgress = new AtomicBoolean(false);

    private final CrawlingService crawlingService;
    private final LogoCrawlerService logoCrawlerService;
    private final RssCrawlerService rssCrawlerService;
    private final TossBackfillService tossBackfillService;

    @Value("${crawler.api-key}")
    private String apiKey;

    public CrawlController(CrawlingService crawlingService,
                           LogoCrawlerService logoCrawlerService,
                           RssCrawlerService rssCrawlerService,
                           TossBackfillService tossBackfillService) {
        this.crawlingService = crawlingService;
        this.logoCrawlerService = logoCrawlerService;
        this.rssCrawlerService = rssCrawlerService;
        this.tossBackfillService = tossBackfillService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> crawlAll(
            @RequestHeader("X-Crawler-Key") String key) {
        if (!apiKey.equals(key)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (!crawlInProgress.compareAndSet(false, true)) {
            return ResponseEntity.accepted().body(Map.of("status", "already_running"));
        }

        crawlExecutor.execute(() -> {
            try {
                CrawlSummary summary = crawlingService.crawlAll();
                log.info("전체 크롤링 완료: 추가 {}건, 실패 {}건", summary.articlesAdded(), summary.failures());
            } catch (Exception e) {
                log.error("전체 크롤링 중 오류 발생", e);
            } finally {
                crawlInProgress.set(false);
            }
        });
        return ResponseEntity.accepted().body(Map.of("status", "triggered"));
    }

    @PostMapping("/{companyId}")
    public ResponseEntity<Map<String, Object>> crawlCompany(
            @PathVariable Long companyId,
            @RequestHeader("X-Crawler-Key") String key) {
        if (!apiKey.equals(key)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        CrawlSummary summary = crawlingService.crawlById(companyId);
        return ResponseEntity.ok(Map.of(
                "articlesAdded", summary.articlesAdded(),
                "failures", summary.failures()
        ));
    }

    @PostMapping("/repair-thumbnails")
    public ResponseEntity<Map<String, Object>> repairThumbnails(
            @RequestHeader("X-Crawler-Key") String key) {
        if (!apiKey.equals(key)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        int count = rssCrawlerService.repairMissingThumbnails();
        return ResponseEntity.ok(Map.of("repairedArticlesCount", count));
    }

    @PostMapping("/repair-tags")
    public ResponseEntity<Map<String, Object>> repairTags(
            @RequestHeader("X-Crawler-Key") String key) {
        if (!apiKey.equals(key)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        int count = rssCrawlerService.repairMissingTags();
        return ResponseEntity.ok(Map.of("repairedTagsCount", count));
    }

    @PostMapping("/logos")
    public ResponseEntity<Map<String, Object>> crawlLogos(
            @RequestHeader("X-Crawler-Key") String key) {
        if (!apiKey.equals(key)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        int count = logoCrawlerService.crawlAllLogos();
        return ResponseEntity.ok(Map.of("updatedLogosCount", count));
    }

    @PostMapping("/toss-backfill")
    public ResponseEntity<Map<String, Object>> tossBackfill(
            @RequestHeader("X-Crawler-Key") String key) {
        if (!apiKey.equals(key)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        int added = tossBackfillService.backfill();
        return ResponseEntity.ok(Map.of("articlesAdded", added));
    }

    @PostMapping("/repair-toss-dates")
    public ResponseEntity<Map<String, Object>> repairTossDates(
            @RequestHeader("X-Crawler-Key") String key) {
        if (!apiKey.equals(key)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        int count = tossBackfillService.repairDates();
        return ResponseEntity.ok(Map.of("repairedDatesCount", count));
    }
}
