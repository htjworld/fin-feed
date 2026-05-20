package com.finfeed.company;

import com.finfeed.common.Sector;

import java.lang.reflect.Field;

public final class CompanyMother {

    private CompanyMother() {}

    public static Company withSector(Sector sector) {
        Company company = new Company();
        setField(company, "id", 1L);
        setField(company, "name", "Test Company");
        setField(company, "nameEn", "Test Co.");
        setField(company, "siteUrl", "https://example.com");
        setField(company, "sector", sector);
        setField(company, "active", true);
        return company;
    }

    public static Company withRssUrl(String rssUrl) {
        Company company = withSector(Sector.CRYPTO);
        setField(company, "rssUrl", rssUrl);
        return company;
    }

    private static void setField(Object target, String fieldName, Object value) {
        try {
            Field field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set field: " + fieldName, e);
        }
    }
}
