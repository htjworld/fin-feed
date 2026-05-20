package com.finfeed.article.dto;

import java.util.List;

public record ArticlePageResponse(
        List<ArticleResponse> articles,
        String nextCursor,
        boolean hasNext
) {
    public static ArticlePageResponse of(List<ArticleResponse> articles, String nextCursor, boolean hasNext) {
        return new ArticlePageResponse(articles, nextCursor, hasNext);
    }

    public static ArticlePageResponse empty() {
        return new ArticlePageResponse(List.of(), null, false);
    }
}
