package com.finfeed.crawl;

import com.finfeed.company.Company;
import com.finfeed.company.CompanyRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/crawl")
public class CrawlController {

    private final RssCrawlerService rssCrawlerService;
    private final CompanyRepository companyRepository;

    @Value("${crawler.api-key}")
    private String apiKey;

    public CrawlController(RssCrawlerService rssCrawlerService, CompanyRepository companyRepository) {
        this.rssCrawlerService = rssCrawlerService;
        this.companyRepository = companyRepository;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> crawlAll(
            @RequestHeader("X-Crawler-Key") String key
    ) {
        if (!apiKey.equals(key)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        RssCrawlerService.CrawlSummary summary = rssCrawlerService.crawlAll();
        return ResponseEntity.ok(Map.of(
                "articlesAdded", summary.articlesAdded(),
                "failures", summary.failures()
        ));
    }

    @PostMapping("/{companyId}")
    public ResponseEntity<Map<String, Object>> crawlCompany(
            @PathVariable Long companyId,
            @RequestHeader("X-Crawler-Key") String key
    ) {
        if (!apiKey.equals(key)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found: " + companyId));
        RssCrawlerService.CrawlSummary summary = rssCrawlerService.crawlCompany(company);
        return ResponseEntity.ok(Map.of(
                "articlesAdded", summary.articlesAdded(),
                "failures", summary.failures()
        ));
    }

    @PostMapping("/repair-thumbnails")
    public ResponseEntity<Map<String, Object>> repairThumbnails(
            @RequestHeader("X-Crawler-Key") String key
    ) {
        if (!apiKey.equals(key)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        int repairedCount = rssCrawlerService.repairMissingThumbnails();
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "repairedArticlesCount", repairedCount
        ));
    }
}
