package com.finfeed;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FinFeedApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinFeedApplication.class, args);
    }
}
