package com.finfeed.crawl;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "backfill_log")
public class BackfillLog {

    @Id
    @Column(length = 100)
    private String name;

    @Column(name = "executed_at")
    private LocalDateTime executedAt;

    @Column(name = "articles_added")
    private int articlesAdded;

    protected BackfillLog() {}

    public BackfillLog(String name, LocalDateTime executedAt, int articlesAdded) {
        this.name = name;
        this.executedAt = executedAt;
        this.articlesAdded = articlesAdded;
    }

    public String getName() { return name; }
    public LocalDateTime getExecutedAt() { return executedAt; }
    public int getArticlesAdded() { return articlesAdded; }
}
