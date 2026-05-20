package com.finfeed.company;

import com.finfeed.common.Sector;
import com.finfeed.crawl.CrawlType;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "name_en", length = 100)
    private String nameEn;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(name = "rss_url", columnDefinition = "TEXT")
    private String rssUrl;

    @Column(name = "site_url", nullable = false, columnDefinition = "TEXT")
    private String siteUrl;

    @Column(name = "blog_url", columnDefinition = "TEXT")
    private String blogUrl;

    @Column(length = 50)
    private Sector sector;

    @Column(name = "crawl_type", length = 20)
    private CrawlType crawlType = CrawlType.RSS;

    @Column(name = "is_active")
    private boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    protected Company() {}

    @PrePersist
    private void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (crawlType == null) crawlType = CrawlType.NONE;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getNameEn() { return nameEn; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public String getRssUrl() { return rssUrl; }
    public String getSiteUrl() { return siteUrl; }
    public String getBlogUrl() { return blogUrl; }
    public Sector getSector() { return sector; }
    public CrawlType getCrawlType() { return crawlType == null ? CrawlType.NONE : crawlType; }
    public boolean isActive() { return active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
