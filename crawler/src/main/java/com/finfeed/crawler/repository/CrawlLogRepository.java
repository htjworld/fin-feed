package com.finfeed.crawler.repository;

import com.finfeed.crawler.domain.CrawlLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CrawlLogRepository extends JpaRepository<CrawlLog, Long> {}
