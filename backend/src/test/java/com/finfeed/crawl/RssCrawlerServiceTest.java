package com.finfeed.crawl;

import com.finfeed.article.Article;
import com.finfeed.article.ArticleRepository;
import com.finfeed.company.Company;
import com.finfeed.company.CompanyMother;
import com.finfeed.company.CompanyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class RssCrawlerServiceTest {

    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private ArticleRepository articleRepository;
    @Mock
    private CrawlLogRepository crawlLogRepository;

    private RssCrawlerService rssCrawlerService;

    @BeforeEach
    void setUp() {
        rssCrawlerService = new RssCrawlerService(companyRepository, articleRepository, crawlLogRepository);
    }

    @Test
    void crawlAll_returnsZeroWhenNoCompaniesWithRss() {
        given(companyRepository.findByActiveTrueAndRssUrlNotNull()).willReturn(List.of());

        RssCrawlerService.CrawlSummary summary = rssCrawlerService.crawlAll();

        assertThat(summary.articlesAdded()).isZero();
        assertThat(summary.failures()).isZero();
    }

    @Test
    void crawlAll_countsFailureWhenCompanyCrawlFails() {
        Company company = CompanyMother.withRssUrl("https://invalid-rss-that-does-not-exist.example.com/feed");
        given(companyRepository.findByActiveTrueAndRssUrlNotNull()).willReturn(List.of(company));

        RssCrawlerService.CrawlSummary summary = rssCrawlerService.crawlAll();

        assertThat(summary.failures()).isEqualTo(1);
        assertThat(summary.articlesAdded()).isZero();
        verify(crawlLogRepository).save(any(CrawlLog.class));
    }

    @Test
    void crawlSummary_mergesCombinesResults() {
        RssCrawlerService.CrawlSummary a = new RssCrawlerService.CrawlSummary(5, 1);
        RssCrawlerService.CrawlSummary b = new RssCrawlerService.CrawlSummary(3, 2);

        RssCrawlerService.CrawlSummary merged = a.merge(b);

        assertThat(merged.articlesAdded()).isEqualTo(8);
        assertThat(merged.failures()).isEqualTo(3);
    }

    @Test
    void crawlSummary_zeroIsIdentityForMerge() {
        RssCrawlerService.CrawlSummary summary = new RssCrawlerService.CrawlSummary(10, 2);

        RssCrawlerService.CrawlSummary merged = RssCrawlerService.CrawlSummary.ZERO.merge(summary);

        assertThat(merged.articlesAdded()).isEqualTo(10);
        assertThat(merged.failures()).isEqualTo(2);
    }

    @Test
    void crawlCompany_skipsExistingArticle() {
        Company company = CompanyMother.withRssUrl("https://invalid-rss-that-does-not-exist.example.com/feed");
        given(companyRepository.findByActiveTrueAndRssUrlNotNull()).willReturn(List.of(company));

        rssCrawlerService.crawlAll();

        verify(articleRepository, never()).save(any(Article.class));
    }
}
