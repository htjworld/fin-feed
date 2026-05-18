package com.finfeed.article;

import com.finfeed.article.dto.ArticleFilter;
import com.finfeed.article.dto.CursorPage;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class ArticleRepositoryCustomImpl implements ArticleRepositoryCustom {

    @PersistenceContext
    private EntityManager em;

    @Override
    public List<Article> findWithFilter(ArticleFilter filter, CursorPage cursor) {
        List<Long> ids = fetchIds(filter, cursor);
        if (ids.isEmpty()) return List.of();
        return fetchByIds(ids);
    }

    @SuppressWarnings("unchecked")
    private List<Long> fetchIds(ArticleFilter filter, CursorPage cursor) {
        StringBuilder sql = new StringBuilder("""
                SELECT a.id
                FROM articles a
                JOIN companies c ON a.company_id = c.id
                WHERE c.is_active = true
                """);

        Map<String, Object> params = new HashMap<>();
        List<String> conditions = new ArrayList<>();

        if (filter.sector() != null) {
            conditions.add("c.sector = :sector");
            params.put("sector", filter.sector());
        }
        if (filter.companyId() != null) {
            conditions.add("c.id = :companyId");
            params.put("companyId", filter.companyId());
        }
        if (filter.tag() != null) {
            conditions.add(":tag = ANY(a.tags)");
            params.put("tag", filter.tag());
        }
        if (filter.q() != null && !filter.q().isBlank()) {
            conditions.add("a.search_vector @@ plainto_tsquery('simple', :q)");
            params.put("q", filter.q().trim());
        }
        if (cursor.hasValue()) {
            conditions.add("(a.published_at < :cursorDate OR (a.published_at = :cursorDate AND a.id < :cursorId))");
            params.put("cursorDate", cursor.publishedAt());
            params.put("cursorId", cursor.id());
        }

        for (String condition : conditions) {
            sql.append(" AND ").append(condition);
        }
        sql.append(" ORDER BY a.published_at DESC, a.id DESC LIMIT :size");
        params.put("size", filter.size() + 1);

        Query query = em.createNativeQuery(sql.toString());
        params.forEach(query::setParameter);

        return ((List<?>) query.getResultList()).stream()
                .map(o -> ((Number) o).longValue())
                .toList();
    }

    @SuppressWarnings("unchecked")
    private List<Article> fetchByIds(List<Long> ids) {
        return em.createQuery("""
                        SELECT a FROM Article a
                        JOIN FETCH a.company
                        WHERE a.id IN :ids
                        ORDER BY a.publishedAt DESC, a.id DESC
                        """, Article.class)
                .setParameter("ids", ids)
                .getResultList();
    }
}
