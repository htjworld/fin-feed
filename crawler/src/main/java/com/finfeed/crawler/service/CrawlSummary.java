package com.finfeed.crawler.service;

public record CrawlSummary(int articlesAdded, int failures) {
    static final CrawlSummary ZERO = new CrawlSummary(0, 0);

    CrawlSummary merge(CrawlSummary other) {
        return new CrawlSummary(this.articlesAdded + other.articlesAdded, this.failures + other.failures);
    }
}
