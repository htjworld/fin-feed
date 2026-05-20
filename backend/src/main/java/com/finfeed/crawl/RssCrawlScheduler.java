package com.finfeed.crawl;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RssCrawlScheduler {

    private final CrawlingService crawlingService;

    public RssCrawlScheduler(CrawlingService crawlingService) {
        this.crawlingService = crawlingService;
    }

    @Scheduled(cron = "${crawler.schedule.cron:0 0 */6 * * *}")
    public void crawlAll() {
        crawlingService.crawlAll();
    }
}
