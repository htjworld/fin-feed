package com.finfeed.collection;

import com.finfeed.article.Article;
import com.finfeed.article.dto.ArticleResponse;
import com.finfeed.collection.dto.CollectionDetailResponse;
import com.finfeed.collection.dto.CollectionSummaryResponse;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CollectionService {

    private final CollectionRepository collectionRepository;

    @PersistenceContext
    private EntityManager em;

    public CollectionService(CollectionRepository collectionRepository) {
        this.collectionRepository = collectionRepository;
    }

    @Cacheable("collections")
    public List<CollectionSummaryResponse> findAll() {
        return collectionRepository.findAllWithArticleCount().stream()
                .map(CollectionSummaryResponse::of)
                .toList();
    }

    public CollectionDetailResponse findById(Long id) {
        Collection collection = collectionRepository.findById(id)
                .orElseThrow(() -> new CollectionNotFoundException(id));

        @SuppressWarnings("unchecked")
        List<Long> articleIds = em.createNativeQuery(
                "SELECT article_id FROM collection_article WHERE collection_id = :id ORDER BY sort_order"
        ).setParameter("id", id).getResultList().stream()
                .map(o -> ((Number) o).longValue())
                .toList();

        if (articleIds.isEmpty()) {
            return CollectionDetailResponse.of(collection, List.of());
        }

        @SuppressWarnings("unchecked")
        List<Article> articles = em.createQuery(
                "SELECT a FROM Article a JOIN FETCH a.company WHERE a.id IN :ids ORDER BY a.publishedAt DESC",
                Article.class
        ).setParameter("ids", articleIds).getResultList();

        List<ArticleResponse> responses = articles.stream().map(ArticleResponse::of).toList();
        return CollectionDetailResponse.of(collection, responses);
    }
}
