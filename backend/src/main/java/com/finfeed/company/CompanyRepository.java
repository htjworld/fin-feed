package com.finfeed.company;

import com.finfeed.common.Sector;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    @Query(value = """
            SELECT c.id, c.name, c.name_en, c.logo_url, c.site_url, c.sector,
                   COUNT(a.id) AS article_count
            FROM companies c
            LEFT JOIN articles a ON a.company_id = c.id
            WHERE c.is_active = true
            GROUP BY c.id
            ORDER BY c.name
            """, nativeQuery = true)
    List<Object[]> findAllWithArticleCount();

    @Query(value = """
            SELECT c.id, c.name, c.name_en, c.logo_url, c.site_url, c.sector,
                   COUNT(a.id) AS article_count
            FROM companies c
            LEFT JOIN articles a ON a.company_id = c.id
            WHERE c.is_active = true AND c.sector = :sector
            GROUP BY c.id
            ORDER BY c.name
            """, nativeQuery = true)
    List<Object[]> findAllWithArticleCountBySector(@Param("sector") String sector);

    List<Company> findByActiveTrueAndRssUrlNotNull();

    List<Company> findBySectorAndActiveTrue(Sector sector);
}
