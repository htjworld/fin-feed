package com.finfeed.crawler.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class SectorConverter implements AttributeConverter<Sector, String> {
    @Override
    public String convertToDatabaseColumn(Sector s) { return s == null ? null : s.getValue(); }
    @Override
    public Sector convertToEntityAttribute(String d) { return d == null ? null : Sector.fromValue(d); }
}
