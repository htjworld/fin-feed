package com.finfeed.crawler.service;

import com.finfeed.crawler.domain.Company;
import com.finfeed.crawler.domain.CrawlType;
import com.finfeed.crawler.repository.CompanyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CrawlerRunner {

    private static final Logger log = LoggerFactory.getLogger(CrawlerRunner.class);

    private final CompanyRepository companyRepository;
    private final RssCrawlerService rssCrawlerService;
    private final MediumBlogCrawlerService mediumBlogCrawlerService;
    private final SelectorBlogCrawlerService selectorBlogCrawlerService;

    public CrawlerRunner(CompanyRepository companyRepository,
                         RssCrawlerService rssCrawlerService,
                         MediumBlogCrawlerService mediumBlogCrawlerService,
                         SelectorBlogCrawlerService selectorBlogCrawlerService) {
        this.companyRepository = companyRepository;
        this.rssCrawlerService = rssCrawlerService;
        this.mediumBlogCrawlerService = mediumBlogCrawlerService;
        this.selectorBlogCrawlerService = selectorBlogCrawlerService;
    }

    public int runAll() {
        List<Company> companies = companyRepository.findByActiveTrueAndCrawlTypeNot(CrawlType.NONE);
        log.info("크롤링 시작: {}개 회사", companies.size());

        CrawlSummary total = companies.stream()
                .map(this::crawl)
                .reduce(CrawlSummary.ZERO, CrawlSummary::merge);

        log.info("크롤링 완료: 수집 {}개, 실패 {}개", total.articlesAdded(), total.failures());
        return total.failures();
    }

    private CrawlSummary crawl(Company company) {
        log.info("[{}] {} 크롤링 시작", company.getNameEn(), company.getCrawlType());
        return switch (company.getCrawlType()) {
            case RSS           -> rssCrawlerService.crawlCompany(company);
            case MEDIUM_APOLLO -> mediumBlogCrawlerService.crawlCompany(company);
            case CSS_SELECTOR  -> selectorBlogCrawlerService.crawlCompany(company);
            case NONE          -> CrawlSummary.ZERO;
        };
    }
}
