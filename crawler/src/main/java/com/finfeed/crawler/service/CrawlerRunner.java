package com.finfeed.crawler.service;

import com.finfeed.crawler.domain.Company;
import com.finfeed.crawler.domain.CrawlType;
import com.finfeed.crawler.repository.CompanyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    public int runForLowCount(int threshold) {
        Map<Long, Long> countMap = companyRepository.findArticleCountsByCompanyId().stream()
                .collect(Collectors.toMap(
                        row -> ((Number) row[0]).longValue(),
                        row -> ((Number) row[1]).longValue()
                ));

        List<Company> allCompanies = companyRepository.findByActiveTrueAndCrawlTypeNot(CrawlType.NONE);

        log.info("======= 현재 회사별 아티클 수 =======");
        allCompanies.stream()
                .sorted(Comparator.comparingLong(c -> countMap.getOrDefault(c.getId(), 0L)))
                .forEach(c -> log.info("  {} - {}개 [{}]",
                        c.getName(), countMap.getOrDefault(c.getId(), 0L), c.getCrawlType()));
        log.info("====================================");

        List<Company> targets = allCompanies.stream()
                .filter(c -> countMap.getOrDefault(c.getId(), 0L) < threshold)
                .toList();

        if (targets.isEmpty()) {
            log.info("{}개 미만 회사 없음, 종료", threshold);
            return 0;
        }

        log.info("대상 {}개사 크롤링 시작 (현재 {}개 미만)", targets.size(), threshold);

        CrawlSummary total = CrawlSummary.ZERO;
        for (Company company : targets) {
            long before = countMap.getOrDefault(company.getId(), 0L);
            CrawlSummary result = crawl(company);
            total = total.merge(result);
            log.info("[{}] {}개 → +{}개 추가 (합계 {}개)", company.getName(), before, result.articlesAdded(), before + result.articlesAdded());
        }

        log.info("=== 완료: 총 {}개 추가, 실패 {}건 ===", total.articlesAdded(), total.failures());
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
