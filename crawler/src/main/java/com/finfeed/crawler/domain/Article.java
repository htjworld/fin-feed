package com.finfeed.crawler.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "articles")
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String title;

    @Column(nullable = false, unique = true, columnDefinition = "TEXT")
    private String url;

    @Column(name = "thumbnail_url", columnDefinition = "TEXT")
    private String thumbnailUrl;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "crawled_at")
    private LocalDateTime crawledAt;

    @Convert(converter = StringArrayConverter.class)
    @Column(columnDefinition = "TEXT")
    private String[] tags;

    protected Article() {}

    private Article(Builder b) {
        this.company = b.company;
        this.title = b.title;
        this.url = b.url;
        this.thumbnailUrl = b.thumbnailUrl;
        this.summary = b.summary;
        this.publishedAt = b.publishedAt;
        this.crawledAt = LocalDateTime.now();
        this.tags = b.tags;
    }

    public static Builder builder() { return new Builder(); }

    public Long getId() { return id; }
    public Company getCompany() { return company; }
    public String getTitle() { return title; }
    public String getUrl() { return url; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String t) { this.thumbnailUrl = t; }
    public String getSummary() { return summary; }
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public String[] getTags() { return tags; }

    public static final class Builder {
        private Company company;
        private String title;
        private String url;
        private String thumbnailUrl;
        private String summary;
        private LocalDateTime publishedAt;
        private String[] tags = new String[0];

        public Builder company(Company c) { this.company = c; return this; }
        public Builder title(String t) { this.title = t; return this; }
        public Builder url(String u) { this.url = u; return this; }
        public Builder thumbnailUrl(String t) { this.thumbnailUrl = t; return this; }
        public Builder summary(String s) { this.summary = s; return this; }
        public Builder publishedAt(LocalDateTime p) { this.publishedAt = p; return this; }
        public Builder tags(String[] t) { this.tags = t; return this; }

        public Article build() {
            Objects.requireNonNull(title, "title");
            Objects.requireNonNull(url, "url");
            return new Article(this);
        }
    }
}
