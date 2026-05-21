package com.finfeed.collection.dto;

import com.finfeed.collection.Collection;

public record CollectionSummaryResponse(
        Long id,
        String name,
        String description,
        long articleCount
) {
    public static CollectionSummaryResponse of(Object[] row) {
        return new CollectionSummaryResponse(
                ((Number) row[0]).longValue(),
                (String) row[1],
                (String) row[2],
                ((Number) row[3]).longValue()
        );
    }
}
