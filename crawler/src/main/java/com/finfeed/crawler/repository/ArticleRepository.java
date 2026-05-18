package com.finfeed.crawler.repository;

import com.finfeed.crawler.domain.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ArticleRepository extends JpaRepository<Article, Long> {
    boolean existsByUrl(String url);

    @Query("SELECT a FROM Article a WHERE a.thumbnailUrl IS NULL OR a.thumbnailUrl = ''")
    List<Article> findMissingThumbnails();
}
