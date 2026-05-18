package com.finfeed.common;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class SectorConverter implements AttributeConverter<Sector, String> {

    @Override
    public String convertToDatabaseColumn(Sector sector) {
        return sector == null ? null : sector.getValue();
    }

    @Override
    public Sector convertToEntityAttribute(String dbData) {
        return dbData == null ? null : Sector.fromValue(dbData);
    }
}
