package com.finfeed;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class FinFeedApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinFeedApplication.class, args);
    }
}
