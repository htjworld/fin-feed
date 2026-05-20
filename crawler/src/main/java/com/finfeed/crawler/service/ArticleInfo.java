package com.finfeed.crawler.service;

import java.time.LocalDateTime;

record ArticleInfo(
        String url,
        String title,
        String summary,
        String thumbnailUrl,
        LocalDateTime publishedAt,
        String[] tags
) {}
