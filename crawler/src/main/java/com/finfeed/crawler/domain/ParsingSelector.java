package com.finfeed.crawler.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "parsing_selectors")
public class ParsingSelector {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", unique = true, nullable = false)
    private Company company;

    @Column(name = "blog_url", nullable = false, columnDefinition = "TEXT")
    private String blogUrl;

    @Column(name = "article_selector", nullable = false, columnDefinition = "TEXT")
    private String articleSelector;

    @Column(name = "title_selector", nullable = false, columnDefinition = "TEXT")
    private String titleSelector;

    @Column(name = "link_selector", nullable = false, columnDefinition = "TEXT")
    private String linkSelector;

    @Column(name = "thumbnail_selector", columnDefinition = "TEXT")
    private String thumbnailSelector;

    @Column(name = "date_selector", columnDefinition = "TEXT")
    private String dateSelector;

    @Column(name = "pagination_type", length = 20)
    private String paginationType = "NONE";

    @Column(name = "next_page_selector", columnDefinition = "TEXT")
    private String nextPageSelector;

    protected ParsingSelector() {}

    public Company getCompany() { return company; }
    public String getBlogUrl() { return blogUrl; }
    public String getArticleSelector() { return articleSelector; }
    public String getTitleSelector() { return titleSelector; }
    public String getLinkSelector() { return linkSelector; }
    public String getThumbnailSelector() { return thumbnailSelector; }
    public String getDateSelector() { return dateSelector; }
    public String getPaginationType() { return paginationType; }
    public String getNextPageSelector() { return nextPageSelector; }
}
