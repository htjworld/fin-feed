package com.finfeed.crawl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/crawl")
public class CrawlController {

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

        CrawlSummary summary = crawlingService.crawlAll();
        return ResponseEntity.ok(Map.of(
                "articlesAdded", summary.articlesAdded(),
                "failures", summary.failures()
        ));
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
