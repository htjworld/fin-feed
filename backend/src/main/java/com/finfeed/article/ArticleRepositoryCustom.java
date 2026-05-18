package com.finfeed.article;

import com.finfeed.article.dto.ArticleFilter;
import com.finfeed.article.dto.CursorPage;

import java.util.List;

interface ArticleRepositoryCustom {
    List<Article> findWithFilter(ArticleFilter filter, CursorPage cursor);
}
