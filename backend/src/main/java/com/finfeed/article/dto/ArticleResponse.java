package com.finfeed.article.dto;

import com.finfeed.article.Article;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

public record ArticleResponse(
        Long id,
        String title,
        String url,
        String thumbnailUrl,
        String summary,
        LocalDateTime publishedAt,
        List<String> tags,
        CompanyInfo company
) {
    public static ArticleResponse of(Article article) {
        return new ArticleResponse(
                article.getId(),
                article.getTitle(),
                article.getUrl(),
                article.getThumbnailUrl(),
                article.getSummary(),
                article.getPublishedAt(),
                article.getTags() != null ? Arrays.asList(article.getTags()) : List.of(),
                CompanyInfo.of(article.getCompany())
        );
    }

    public record CompanyInfo(
            Long id,
            String name,
            String nameEn,
            String logoUrl,
            String sector
    ) {
        public static CompanyInfo of(com.finfeed.company.Company company) {
            return new CompanyInfo(
                    company.getId(),
                    company.getName(),
                    company.getNameEn(),
                    company.getLogoUrl(),
                    company.getSector() != null ? company.getSector().getValue() : null
            );
        }
    }
}
