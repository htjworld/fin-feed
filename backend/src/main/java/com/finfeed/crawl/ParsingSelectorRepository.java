package com.finfeed.crawl;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ParsingSelectorRepository extends JpaRepository<ParsingSelector, Long> {
    Optional<ParsingSelector> findByCompanyId(Long companyId);
}
