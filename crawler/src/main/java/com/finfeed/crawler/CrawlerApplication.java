package com.finfeed.crawler;

import com.finfeed.crawler.service.CrawlerRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

@SpringBootApplication
public class CrawlerApplication {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(CrawlerApplication.class);
        app.setWebApplicationType(WebApplicationType.NONE);

        try (ConfigurableApplicationContext ctx = app.run(args)) {
            CrawlerRunner runner = ctx.getBean(CrawlerRunner.class);
            int failures = runner.runAll();
            System.exit(failures > 0 ? 1 : 0);
        }
    }
}
