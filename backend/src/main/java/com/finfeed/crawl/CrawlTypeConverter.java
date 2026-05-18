package com.finfeed.crawl;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class CrawlTypeConverter implements AttributeConverter<CrawlType, String> {

    @Override
    public String convertToDatabaseColumn(CrawlType attribute) {
        return attribute == null ? CrawlType.NONE.name() : attribute.name();
    }

    @Override
    public CrawlType convertToEntityAttribute(String dbData) {
        if (dbData == null) return CrawlType.NONE;
        try {
            return CrawlType.valueOf(dbData);
        } catch (IllegalArgumentException e) {
            return CrawlType.NONE;
        }
    }
}
