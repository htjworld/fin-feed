package com.finfeed.crawler.domain;

import java.util.Arrays;

public enum Sector {
    DOMESTIC_BANK("domestic_bank"),
    DOMESTIC_FINTECH("domestic_fintech"),
    DOMESTIC_SECURITIES("domestic_securities"),
    CRYPTO("crypto"),
    GLOBAL_FINTECH("global_fintech");

    private final String value;

    Sector(String value) { this.value = value; }

    public String getValue() { return value; }

    public static Sector fromValue(String value) {
        return Arrays.stream(values())
                .filter(s -> s.value.equals(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown sector: " + value));
    }
}
