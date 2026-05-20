package com.finfeed.article.dto;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;

public record CursorPage(LocalDateTime publishedAt, long id) {

    public boolean hasValue() {
        return publishedAt != null;
    }

    public static CursorPage empty() {
        return new CursorPage(null, 0);
    }

    public static CursorPage decode(String encoded) {
        if (encoded == null || encoded.isBlank()) return empty();
        try {
            String raw = new String(Base64.getDecoder().decode(encoded), StandardCharsets.UTF_8);
            int comma = raw.lastIndexOf(',');
            LocalDateTime publishedAt = LocalDateTime.parse(raw.substring(0, comma));
            long id = Long.parseLong(raw.substring(comma + 1));
            return new CursorPage(publishedAt, id);
        } catch (Exception e) {
            return empty();
        }
    }

    public String encode() {
        if (!hasValue()) return null;
        String raw = publishedAt.toString() + "," + id;
        return Base64.getEncoder().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
    }
}
