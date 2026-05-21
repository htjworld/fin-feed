package com.finfeed.collection;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CollectionRepository extends JpaRepository<Collection, Long> {

    @Query(value = """
            SELECT c.id, c.name, c.description, COUNT(ca.article_id) AS article_count
            FROM collection c
            LEFT JOIN collection_article ca ON ca.collection_id = c.id
            GROUP BY c.id
            ORDER BY c.id
            """, nativeQuery = true)
    List<Object[]> findAllWithArticleCount();
}
