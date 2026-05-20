package com.finfeed.article.dto;

public record ArticleFilter(
        String sector,
        Long companyId,
        String tag,
        String q,
        String cursor,
        int size
) {
    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 100;

    public ArticleFilter {
        if (size <= 0) size = DEFAULT_SIZE;
        else if (size > MAX_SIZE) size = MAX_SIZE;
    }
}
