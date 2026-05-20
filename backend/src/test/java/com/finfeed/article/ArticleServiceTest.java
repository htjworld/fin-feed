package com.finfeed.article;

import com.finfeed.article.dto.ArticleFilter;
import com.finfeed.article.dto.ArticlePageResponse;
import com.finfeed.article.dto.CursorPage;
import com.finfeed.company.Company;
import com.finfeed.company.CompanyMother;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class ArticleServiceTest {

    @Mock
    private ArticleRepository articleRepository;

    private ArticleService articleService;

    @BeforeEach
    void setUp() {
        articleService = new ArticleService(articleRepository);
    }

    @Test
    void findArticles_returnsEmptyPageWhenNoArticles() {
        given(articleRepository.findWithFilter(any(), any())).willReturn(List.of());

        ArticleFilter filter = new ArticleFilter(null, null, null, null, null, 20);
        ArticlePageResponse response = articleService.findArticles(filter);

        assertThat(response.articles()).isEmpty();
        assertThat(response.hasNext()).isFalse();
        assertThat(response.nextCursor()).isNull();
    }

    @Test
    void findArticles_hasNextIsFalseWhenResultsLessThanPageSize() {
        List<Article> articles = createArticles(3);
        given(articleRepository.findWithFilter(any(), any())).willReturn(articles);

        ArticleFilter filter = new ArticleFilter(null, null, null, null, null, 20);
        ArticlePageResponse response = articleService.findArticles(filter);

        assertThat(response.articles()).hasSize(3);
        assertThat(response.hasNext()).isFalse();
        assertThat(response.nextCursor()).isNull();
    }

    @Test
    void findArticles_hasNextIsTrueWhenMoreResultsAvailable() {
        List<Article> articles = createArticles(21);
        given(articleRepository.findWithFilter(any(), any())).willReturn(articles);

        ArticleFilter filter = new ArticleFilter(null, null, null, null, null, 20);
        ArticlePageResponse response = articleService.findArticles(filter);

        assertThat(response.articles()).hasSize(20);
        assertThat(response.hasNext()).isTrue();
        assertThat(response.nextCursor()).isNotNull();
    }

    @Test
    void findArticles_nextCursorIsDecodable() {
        List<Article> articles = createArticles(21);
        given(articleRepository.findWithFilter(any(), any())).willReturn(articles);

        ArticleFilter filter = new ArticleFilter(null, null, null, null, null, 20);
        ArticlePageResponse response = articleService.findArticles(filter);

        CursorPage decoded = CursorPage.decode(response.nextCursor());
        assertThat(decoded.hasValue()).isTrue();
        assertThat(decoded.id()).isEqualTo(articles.get(19).getId());
    }

    @Test
    void findArticles_sizeIsCappedAt100() {
        ArticleFilter filter = new ArticleFilter(null, null, null, null, null, 999);
        assertThat(filter.size()).isEqualTo(100);
    }

    @Test
    void findArticles_invalidCursorIsIgnored() {
        given(articleRepository.findWithFilter(any(), any())).willReturn(List.of());

        ArticleFilter filter = new ArticleFilter(null, null, null, null, "not-valid-base64!!!", 20);
        ArticlePageResponse response = articleService.findArticles(filter);

        assertThat(response.articles()).isEmpty();
    }

    private List<Article> createArticles(int count) {
        Company company = CompanyMother.withSector(com.finfeed.common.Sector.CRYPTO);
        List<Article> articles = new ArrayList<>();
        for (int i = count; i >= 1; i--) {
            Article article = Article.builder()
                    .company(company)
                    .title("Article " + i)
                    .url("https://example.com/article-" + i)
                    .publishedAt(LocalDateTime.now().minusDays(i))
                    .build();
            setId(article, (long) i);
            articles.add(article);
        }
        return articles;
    }

    private void setId(Article article, Long id) {
        try {
            Field field = Article.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(article, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
