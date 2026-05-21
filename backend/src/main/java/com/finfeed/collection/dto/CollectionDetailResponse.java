package com.finfeed.collection.dto;

import com.finfeed.article.dto.ArticleResponse;
import com.finfeed.collection.Collection;

import java.util.List;

public record CollectionDetailResponse(
        Long id,
        String name,
        String description,
        List<ArticleResponse> articles
) {
    public static CollectionDetailResponse of(Collection collection, List<ArticleResponse> articles) {
        return new CollectionDetailResponse(
                collection.getId(),
                collection.getName(),
                collection.getDescription(),
                articles
        );
    }
}
