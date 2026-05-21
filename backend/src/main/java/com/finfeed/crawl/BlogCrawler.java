package com.finfeed.crawl;

import com.finfeed.company.Company;

public interface BlogCrawler {

    boolean supports(CrawlType type);

    CrawlSummary crawl(Company company);
}
