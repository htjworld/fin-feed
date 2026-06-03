package com.finfeed.article;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ArticleRepository extends JpaRepository<Article, Long>, ArticleRepositoryCustom {

    boolean existsByUrl(String url);

    boolean existsByCompanyIdAndTitle(Long companyId, String title);

    List<Article> findByCompanyId(Long companyId);

    @Query("SELECT a FROM Article a WHERE a.thumbnailUrl IS NULL OR a.thumbnailUrl = '' OR a.thumbnailUrl LIKE '/img/%'")
    List<Article> findArticlesMissingThumbnails();
}
