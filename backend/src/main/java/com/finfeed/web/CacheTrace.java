package com.finfeed.web;

/** @Cacheable 본문 실행 여부로 요청별 캐시 MISS를 표시. HIT 시 본문이 실행되지 않는 특성을 이용. */
public final class CacheTrace {
    private static final ThreadLocal<Boolean> MISS = new ThreadLocal<>();
    private CacheTrace() {}
    public static void markMiss() { MISS.set(Boolean.TRUE); }
    public static boolean wasMiss() { return Boolean.TRUE.equals(MISS.get()); }
    public static void clear() { MISS.remove(); }
}
