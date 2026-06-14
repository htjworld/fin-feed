package com.finfeed.article;

import com.finfeed.article.dto.ArticleFilter;
import com.finfeed.article.dto.ArticlePageResponse;
import com.finfeed.article.dto.ArticleResponse;
import com.finfeed.article.dto.CursorPage;
import com.finfeed.web.CacheTrace;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ArticleService {

    private final ArticleRepository articleRepository;

    public ArticleService(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    public long countAll() {
        return articleRepository.count();
    }

    @Cacheable(cacheNames = "articles", key = "#filter")
    public ArticlePageResponse findArticles(ArticleFilter filter) {
        CacheTrace.markMiss(); // 본문 실행 = 캐시 MISS (HIT 시 호출 안 됨)
        CursorPage cursor = CursorPage.decode(filter.cursor());
        List<Article> fetched = articleRepository.findWithFilter(filter, cursor);

        boolean hasNext = fetched.size() > filter.size();
        List<Article> articles = hasNext ? fetched.subList(0, filter.size()) : fetched;

        List<ArticleResponse> responses = articles.stream()
                .map(ArticleResponse::of)
                .toList();

        String nextCursor = null;
        if (hasNext && !articles.isEmpty()) {
            Article last = articles.getLast();
            nextCursor = new CursorPage(last.getPublishedAt(), last.getId()).encode();
        }

        return ArticlePageResponse.of(responses, nextCursor, hasNext);
    }
}
