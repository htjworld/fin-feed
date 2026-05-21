package com.finfeed.crawler.repository;

import com.finfeed.crawler.domain.Company;
import com.finfeed.crawler.domain.CrawlType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    List<Company> findByActiveTrueAndCrawlTypeNot(CrawlType crawlType);
    List<Company> findByActiveTrueAndRssUrlNotNull();

    @Query(value = """
            SELECT c.id, COUNT(a.id) AS cnt
            FROM companies c
            LEFT JOIN articles a ON a.company_id = c.id
            WHERE c.is_active = true
            GROUP BY c.id
            """, nativeQuery = true)
    List<Object[]> findArticleCountsByCompanyId();
}
