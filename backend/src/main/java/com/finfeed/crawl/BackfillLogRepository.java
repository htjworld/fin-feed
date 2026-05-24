package com.finfeed.crawl;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BackfillLogRepository extends JpaRepository<BackfillLog, String> {}
