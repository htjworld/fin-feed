package com.finfeed.crawl;

import com.finfeed.company.Company;
import com.finfeed.company.CompanyNotFoundException;
import com.finfeed.company.CompanyRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CrawlingService {

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
        return companyRepository.findByActiveTrue().stream()
                .filter(c -> c.getCrawlType() != CrawlType.NONE)
                .map(this::crawlCompany)
                .reduce(CrawlSummary.ZERO, CrawlSummary::merge);
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
        return crawlers.stream()
                .filter(c -> c.supports(company.getCrawlType()))
                .findFirst()
                .map(c -> c.crawl(company))
                .orElse(CrawlSummary.ZERO);
    }
}
