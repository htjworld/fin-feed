package com.finfeed.crawl;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RssCrawlScheduler {

    private final RssCrawlerService rssCrawlerService;

    public RssCrawlScheduler(RssCrawlerService rssCrawlerService) {
        this.rssCrawlerService = rssCrawlerService;
    }

    @Scheduled(cron = "${crawler.schedule.cron:0 0 */6 * * *}")
    public void crawlAll() {
        rssCrawlerService.crawlAll();
    }
}
