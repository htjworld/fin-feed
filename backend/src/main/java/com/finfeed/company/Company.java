package com.finfeed.company;

import com.finfeed.common.Sector;
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

    @Column(length = 50)
    private Sector sector;

    @Column(name = "is_active")
    private boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    protected Company() {}

    @PrePersist
    private void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getNameEn() { return nameEn; }
    public String getLogoUrl() { return logoUrl; }
    public String getRssUrl() { return rssUrl; }
    public String getSiteUrl() { return siteUrl; }
    public Sector getSector() { return sector; }
    public boolean isActive() { return active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
