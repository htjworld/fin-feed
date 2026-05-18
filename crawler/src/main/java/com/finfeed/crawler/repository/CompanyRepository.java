package com.finfeed.crawler.repository;

import com.finfeed.crawler.domain.Company;
import com.finfeed.crawler.domain.CrawlType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    List<Company> findByActiveTrueAndCrawlTypeNot(CrawlType crawlType);
    List<Company> findByActiveTrueAndRssUrlNotNull();
}
