package com.finfeed.article;

import com.finfeed.article.dto.ArticleFilter;
import com.finfeed.article.dto.ArticlePageResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getArticleCount() {
        return ResponseEntity.ok(Map.of("count", articleService.countAll()));
    }

    @GetMapping
    public ResponseEntity<ArticlePageResponse> getArticles(
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") int size
    ) {
        ArticleFilter filter = new ArticleFilter(sector, companyId, tag, q, cursor, size);
        return ResponseEntity.ok(articleService.findArticles(filter));
    }
}
