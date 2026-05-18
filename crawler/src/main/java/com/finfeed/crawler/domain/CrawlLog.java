package com.finfeed.crawler.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "crawl_logs")
public class CrawlLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private CrawlStatus status;

    @Column(name = "articles_added")
    private int articlesAdded = 0;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "executed_at")
    private LocalDateTime executedAt;

    protected CrawlLog() {}

    public static CrawlLog start(Company company) {
        CrawlLog log = new CrawlLog();
        log.company = company;
        log.executedAt = LocalDateTime.now();
        return log;
    }

    public void succeed(int count) { this.status = CrawlStatus.SUCCESS; this.articlesAdded = count; }
    public void fail(String msg)   { this.status = CrawlStatus.FAIL; this.errorMessage = msg; }
}
