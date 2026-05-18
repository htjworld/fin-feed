package com.finfeed.crawl;

import com.finfeed.company.Company;
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

    public void succeed(int articlesAdded) {
        this.status = CrawlStatus.SUCCESS;
        this.articlesAdded = articlesAdded;
    }

    public void fail(String errorMessage) {
        this.status = CrawlStatus.FAIL;
        this.errorMessage = errorMessage;
    }

    public Long getId() { return id; }
    public Company getCompany() { return company; }
    public CrawlStatus getStatus() { return status; }
    public int getArticlesAdded() { return articlesAdded; }
    public String getErrorMessage() { return errorMessage; }
    public LocalDateTime getExecutedAt() { return executedAt; }
}
