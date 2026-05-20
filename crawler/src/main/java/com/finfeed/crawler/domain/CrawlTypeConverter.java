package com.finfeed.crawler.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class CrawlTypeConverter implements AttributeConverter<CrawlType, String> {
    @Override
    public String convertToDatabaseColumn(CrawlType t) {
        return t == null ? CrawlType.NONE.name() : t.name();
    }
    @Override
    public CrawlType convertToEntityAttribute(String d) {
        if (d == null) return CrawlType.NONE;
        try { return CrawlType.valueOf(d); } catch (Exception e) { return CrawlType.NONE; }
    }
}
