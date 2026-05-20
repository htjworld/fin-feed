package com.finfeed.crawl;

import com.finfeed.company.Company;
import com.finfeed.company.CompanyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CrawlingService {

    private final CompanyRepository companyRepository;
    private final RssCrawlerService rssCrawlerService;
    private final MediumBlogCrawlerService mediumBlogCrawlerService;
    private final SelectorBlogCrawlerService selectorBlogCrawlerService;

    public CrawlingService(CompanyRepository companyRepository,
                           RssCrawlerService rssCrawlerService,
                           MediumBlogCrawlerService mediumBlogCrawlerService,
                           SelectorBlogCrawlerService selectorBlogCrawlerService) {
        this.companyRepository = companyRepository;
        this.rssCrawlerService = rssCrawlerService;
        this.mediumBlogCrawlerService = mediumBlogCrawlerService;
        this.selectorBlogCrawlerService = selectorBlogCrawlerService;
    }

    public RssCrawlerService.CrawlSummary crawlAll() {
        List<Company> companies = companyRepository.findByActiveTrue();
        return companies.stream()
                .filter(c -> c.getCrawlType() != CrawlType.NONE)
                .map(this::crawlCompany)
                .reduce(RssCrawlerService.CrawlSummary.ZERO, RssCrawlerService.CrawlSummary::merge);
    }

    public RssCrawlerService.CrawlSummary crawlCompany(Company company) {
        return switch (company.getCrawlType()) {
            case RSS -> rssCrawlerService.crawlCompany(company);
            case MEDIUM_APOLLO -> mediumBlogCrawlerService.crawlCompany(company);
            case CSS_SELECTOR -> selectorBlogCrawlerService.crawlCompany(company);
            case NONE -> RssCrawlerService.CrawlSummary.ZERO;
        };
    }

    public RssCrawlerService.CrawlSummary crawlById(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found: " + companyId));
        return crawlCompany(company);
    }
}
