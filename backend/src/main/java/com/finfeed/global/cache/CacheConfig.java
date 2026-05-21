package com.finfeed.global.cache;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager();

        // articles: 필터 조합마다 캐시, 크롤 완료 시 전체 evict
        manager.registerCustomCache("articles",
                Caffeine.newBuilder()
                        .expireAfterWrite(10, TimeUnit.MINUTES)
                        .maximumSize(500)
                        .build());

        // companies: 변경 빈도 낮음 (크롤 완료 시 evict)
        manager.registerCustomCache("companies",
                Caffeine.newBuilder()
                        .expireAfterWrite(1, TimeUnit.HOURS)
                        .maximumSize(50)
                        .build());

        // collections: 수동 편집 시에만 변경 — 6시간 TTL
        manager.registerCustomCache("collections",
                Caffeine.newBuilder()
                        .expireAfterWrite(6, TimeUnit.HOURS)
                        .maximumSize(50)
                        .build());

        return manager;
    }
}
