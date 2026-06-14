package com.finfeed.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

/** 엔드포인트별 호출 빈도·소요시간·캐시 HIT/MISS·방문자(익명) 실측용 액세스 로그. */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class AccessLogFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger("ACCESS");

    // 캐시가 적용된 GET 엔드포인트 (HIT/MISS 판정 대상)
    // 주의: /api/articles/count 는 캐시 없음 → 의도적으로 제외 (병목 후보 마킹)
    private static final Set<String> CACHEABLE_PATHS = Set.of("/api/articles", "/api/companies");

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        long start = System.nanoTime();
        try {
            chain.doFilter(req, res);
        } finally {
            long durationMs = (System.nanoTime() - start) / 1_000_000;
            String query = req.getQueryString();
            log.info("method={} path={} query={} status={} durationMs={} cache={} client={}",
                    req.getMethod(),
                    req.getRequestURI(),
                    query == null ? "-" : query,
                    res.getStatus(),
                    durationMs,
                    cacheStatus(req.getMethod(), req.getRequestURI()),
                    clientId(req));
            CacheTrace.clear();
        }
    }

    private String cacheStatus(String method, String path) {
        if (!"GET".equals(method) || !CACHEABLE_PATHS.contains(path)) return "NONE";
        return CacheTrace.wasMiss() ? "MISS" : "HIT";
    }

    /** X-Forwarded-For 우선(Render 프록시 뒤). 방문자 근사용 익명 해시 — 원본 IP는 로그에 남기지 않음. */
    private String clientId(HttpServletRequest req) {
        String fwd = req.getHeader("X-Forwarded-For");
        String ip = (fwd != null && !fwd.isBlank()) ? fwd.split(",")[0].trim() : req.getRemoteAddr();
        return Integer.toHexString(ip.hashCode());
    }

    /** 헬스체크·액추에이터·정적 로고는 API 트래픽 분석에서 제외 (노이즈 차단). */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest req) {
        String p = req.getRequestURI();
        return p.startsWith("/actuator") || "/health".equals(p) || p.startsWith("/logos");
    }
}
