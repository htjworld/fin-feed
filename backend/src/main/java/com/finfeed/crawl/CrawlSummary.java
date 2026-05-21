package com.finfeed.crawl;

public record CrawlSummary(int articlesAdded, int failures) {

    public static final CrawlSummary ZERO = new CrawlSummary(0, 0);

    public static CrawlSummary merge(CrawlSummary a, CrawlSummary b) {
        return new CrawlSummary(a.articlesAdded + b.articlesAdded, a.failures + b.failures);
    }
}
