package com.finfeed.article;

import com.finfeed.company.Company;
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

    @Convert(converter = com.finfeed.common.StringArrayConverter.class)
    @Column(columnDefinition = "TEXT")
    private String[] tags;

    protected Article() {}

    private Article(Builder builder) {
        this.company = builder.company;
        this.title = builder.title;
        this.url = builder.url;
        this.thumbnailUrl = builder.thumbnailUrl;
        this.summary = builder.summary;
        this.publishedAt = builder.publishedAt;
        this.crawledAt = LocalDateTime.now();
        this.tags = builder.tags;
    }

    public static Builder builder() {
        return new Builder();
    }

    public Long getId() { return id; }
    public Company getCompany() { return company; }
    public String getTitle() { return title; }
    public String getUrl() { return url; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public String getSummary() { return summary; }
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public LocalDateTime getCrawledAt() { return crawledAt; }
    public String[] getTags() { return tags; }

    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

    public static final class Builder {
        private Company company;
        private String title;
        private String url;
        private String thumbnailUrl;
        private String summary;
        private LocalDateTime publishedAt;
        private String[] tags = new String[0];

        public Builder company(Company company) { this.company = company; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder url(String url) { this.url = url; return this; }
        public Builder thumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; return this; }
        public Builder summary(String summary) { this.summary = summary; return this; }
        public Builder publishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; return this; }
        public Builder tags(String[] tags) { this.tags = tags; return this; }

        public Article build() {
            Objects.requireNonNull(title, "title is required");
            Objects.requireNonNull(url, "url is required");
            return new Article(this);
        }
    }
}
