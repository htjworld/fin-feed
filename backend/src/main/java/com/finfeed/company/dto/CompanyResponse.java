package com.finfeed.company.dto;

import com.finfeed.company.Company;

public record CompanyResponse(
        Long id,
        String name,
        String nameEn,
        String logoUrl,
        String siteUrl,
        String sector,
        long articleCount,
        String color
) {
    public static CompanyResponse of(Object[] row) {
        return new CompanyResponse(
                ((Number) row[0]).longValue(),
                (String) row[1],
                (String) row[2],
                (String) row[3],
                (String) row[4],
                (String) row[5],
                ((Number) row[6]).longValue(),
                row.length > 7 && row[7] != null ? (String) row[7] : "#888888"
        );
    }

    public static CompanyResponse of(Company company, long articleCount) {
        return new CompanyResponse(
                company.getId(),
                company.getName(),
                company.getNameEn(),
                company.getLogoUrl(),
                company.getSiteUrl(),
                company.getSector() != null ? company.getSector().getValue() : null,
                articleCount,
                company.getColor()
        );
    }
}
