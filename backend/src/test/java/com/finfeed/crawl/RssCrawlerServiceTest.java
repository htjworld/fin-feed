package com.finfeed.crawl;

import com.finfeed.article.Article;
import com.finfeed.article.ArticleRepository;
import com.finfeed.company.Company;
import com.finfeed.company.CompanyMother;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class RssCrawlerServiceTest {

    @Mock
    private ArticleRepository articleRepository;
    @Mock
    private CrawlLogRepository crawlLogRepository;

    private RssCrawlerService rssCrawlerService;

    @BeforeEach
    void setUp() {
        rssCrawlerService = new RssCrawlerService(articleRepository, crawlLogRepository);
    }

    @Test
    void supports_onlyRssType() {
        assertThat(rssCrawlerService.supports(CrawlType.RSS)).isTrue();
        assertThat(rssCrawlerService.supports(CrawlType.MEDIUM_APOLLO)).isFalse();
        assertThat(rssCrawlerService.supports(CrawlType.CSS_SELECTOR)).isFalse();
        assertThat(rssCrawlerService.supports(CrawlType.NONE)).isFalse();
    }

    @Test
    void crawl_countsFailureWhenRssFetchFails() {
        Company company = CompanyMother.withRssUrl("https://invalid-rss-that-does-not-exist.example.com/feed");

        CrawlSummary summary = rssCrawlerService.crawl(company);

        assertThat(summary.failures()).isEqualTo(1);
        assertThat(summary.articlesAdded()).isZero();
        verify(crawlLogRepository).save(any(CrawlLog.class));
    }

    @Test
    void crawlSummary_mergesCombinesResults() {
        CrawlSummary a = new CrawlSummary(5, 1);
        CrawlSummary b = new CrawlSummary(3, 2);

        CrawlSummary merged = CrawlSummary.merge(a, b);

        assertThat(merged.articlesAdded()).isEqualTo(8);
        assertThat(merged.failures()).isEqualTo(3);
    }

    @Test
    void crawlSummary_zeroIsIdentityForMerge() {
        CrawlSummary summary = new CrawlSummary(10, 2);

        CrawlSummary merged = CrawlSummary.merge(CrawlSummary.ZERO, summary);

        assertThat(merged.articlesAdded()).isEqualTo(10);
        assertThat(merged.failures()).isEqualTo(2);
    }

    @Test
    void crawl_skipsWhenRssUrlIsNull() {
        Company company = CompanyMother.withRssUrl(null);

        CrawlSummary summary = rssCrawlerService.crawl(company);

        assertThat(summary).isEqualTo(CrawlSummary.ZERO);
        verify(articleRepository, never()).save(any(Article.class));
    }
}
