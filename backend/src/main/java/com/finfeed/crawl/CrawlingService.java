package com.finfeed.crawl;

import com.finfeed.company.Company;
import com.finfeed.company.CompanyNotFoundException;
import com.finfeed.company.CompanyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CrawlingService {

    private static final Logger log = LoggerFactory.getLogger(CrawlingService.class);

    private final CompanyRepository companyRepository;
    private final List<BlogCrawler> crawlers;

    public CrawlingService(CompanyRepository companyRepository, List<BlogCrawler> crawlers) {
        this.companyRepository = companyRepository;
        this.crawlers = crawlers;
    }

    @Caching(evict = {
        @CacheEvict(cacheNames = "articles", allEntries = true),
        @CacheEvict(cacheNames = "companies", allEntries = true)
    })
    public CrawlSummary crawlAll() {
        long startNanos = System.nanoTime();
        List<Company> targets = companyRepository.findByActiveTrue().stream()
                .filter(c -> c.getCrawlType() != CrawlType.NONE)
                .toList();
        log.info("전체 크롤링 시작: 대상 {}개 회사", targets.size());

        CrawlSummary total = targets.stream()
                .map(this::crawlCompany)
                .reduce(CrawlSummary.ZERO, CrawlSummary::merge);

        long elapsedMs = (System.nanoTime() - startNanos) / 1_000_000;
        int failedCompanies = total.failures();
        int succeededCompanies = targets.size() - failedCompanies;
        log.info("전체 크롤링 완료: 성공 {}개사, 실패 {}개사, 신규 아티클 {}건, 소요 {}ms ({}초)",
                succeededCompanies, failedCompanies, total.articlesAdded(), elapsedMs, elapsedMs / 1000);
        return total;
    }

    @Caching(evict = {
        @CacheEvict(cacheNames = "articles", allEntries = true),
        @CacheEvict(cacheNames = "companies", allEntries = true)
    })
    public CrawlSummary crawlById(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new CompanyNotFoundException(companyId));
        return crawlCompany(company);
    }

    // package-private: 내부 오케스트레이션 전용, Spring proxy 우회를 피하기 위해 crawlAll/crawlById에서 직접 호출
    CrawlSummary crawlCompany(Company company) {
        log.info("[{}] 크롤링 시작 (type={})", company.getNameEn(), company.getCrawlType());
        long startNanos = System.nanoTime();

        CrawlSummary summary = crawlers.stream()
                .filter(c -> c.supports(company.getCrawlType()))
                .findFirst()
                .map(c -> c.crawl(company))
                .orElseGet(() -> {
                    log.warn("[{}] 지원하는 크롤러 없음 (type={})", company.getNameEn(), company.getCrawlType());
                    return CrawlSummary.ZERO;
                });

        long elapsedMs = (System.nanoTime() - startNanos) / 1_000_000;
        if (summary.failures() > 0) {
            log.error("[{}] 크롤링 실패 (type={}, {}ms) — 상세 원인은 위 ERROR 스택트레이스 참조",
                    company.getNameEn(), company.getCrawlType(), elapsedMs);
        } else {
            log.info("[{}] 크롤링 완료: 신규 {}건 ({}ms)",
                    company.getNameEn(), summary.articlesAdded(), elapsedMs);
        }
        return summary;
    }
}
