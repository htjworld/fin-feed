package com.finfeed.article;

import com.finfeed.article.dto.CursorPage;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class CursorPageTest {

    @Test
    void emptyReturnsNoValue() {
        assertThat(CursorPage.empty().hasValue()).isFalse();
    }

    @Test
    void decodeNullReturnsEmpty() {
        assertThat(CursorPage.decode(null).hasValue()).isFalse();
    }

    @Test
    void decodeBlankReturnsEmpty() {
        assertThat(CursorPage.decode("  ").hasValue()).isFalse();
    }

    @Test
    void decodeInvalidReturnsEmpty() {
        assertThat(CursorPage.decode("garbage").hasValue()).isFalse();
    }

    @Test
    void encodeDecodeRoundTrip() {
        LocalDateTime now = LocalDateTime.of(2026, 5, 18, 9, 0, 0);
        CursorPage original = new CursorPage(now, 42L);

        String encoded = original.encode();
        assertThat(encoded).isNotNull();

        CursorPage decoded = CursorPage.decode(encoded);
        assertThat(decoded.hasValue()).isTrue();
        assertThat(decoded.publishedAt()).isEqualTo(now);
        assertThat(decoded.id()).isEqualTo(42L);
    }

    @Test
    void emptyEncodeReturnsNull() {
        assertThat(CursorPage.empty().encode()).isNull();
    }
}
