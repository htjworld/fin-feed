package com.finfeed.crawler.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class StringArrayConverter implements AttributeConverter<String[], String> {
    @Override
    public String convertToDatabaseColumn(String[] a) {
        return (a == null || a.length == 0) ? null : String.join(",", a);
    }
    @Override
    public String[] convertToEntityAttribute(String d) {
        return (d == null || d.isBlank()) ? new String[0] : d.split(",");
    }
}
