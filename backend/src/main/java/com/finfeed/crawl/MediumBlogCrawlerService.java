package com.finfeed.crawl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finfeed.article.Article;
import com.finfeed.article.ArticleRepository;
import com.finfeed.company.Company;
import com.rometools.rome.feed.synd.SyndContent;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
public class MediumBlogCrawlerService implements BlogCrawler {

    private static final int TIMEOUT_MS = 15_000;
    private static final String USER_AGENT =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

    private final ArticleRepository articleRepository;
    private final CrawlLogRepository crawlLogRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MediumBlogCrawlerService(ArticleRepository articleRepository,
                                    CrawlLogRepository crawlLogRepository) {
        this.articleRepository = articleRepository;
        this.crawlLogRepository = crawlLogRepository;
    }

    @Override
    public boolean supports(CrawlType type) {
        return type == CrawlType.MEDIUM_APOLLO;
    }

    @Override
    @Transactional
    public CrawlSummary crawl(Company company) {
        String blogUrl = company.getBlogUrl();
        if (blogUrl == null || blogUrl.isBlank()) return CrawlSummary.ZERO;

        CrawlLog log = CrawlLog.start(company);
        try {
            List<ArticleInfo> articles = fetchArticles(blogUrl);
            int added = 0;
            for (ArticleInfo info : articles) {
                if (saveArticle(company, info)) added++;
            }
            log.succeed(added);
            crawlLogRepository.save(log);
            return new CrawlSummary(added, 0);
        } catch (Exception e) {
            log.fail(e.getMessage());
            crawlLogRepository.save(log);
            return new CrawlSummary(0, 1);
        }
    }

    private List<ArticleInfo> fetchArticles(String blogUrl) {
        String feedUrl = buildMediumFeedUrl(blogUrl);
        if (feedUrl != null) {
            List<ArticleInfo> rssArticles = fetchFromRss(feedUrl);
            if (!rssArticles.isEmpty()) return rssArticles;
        }
        return fetchFromApolloState(blogUrl);
    }

    private String buildMediumFeedUrl(String blogUrl) {
        try {
            URI uri = URI.create(encodeNonAscii(blogUrl));
            if (!"medium.com".equals(uri.getHost())) return null;
            return "https://medium.com/feed" + uri.getRawPath();
        } catch (Exception e) {
            return null;
        }
    }

    private List<ArticleInfo> fetchFromRss(String feedUrl) {
        try {
            URL url = new URL(feedUrl);
            SyndFeed feed = new SyndFeedInput().build(new XmlReader(url));
            List<ArticleInfo> articles = new ArrayList<>();
            for (SyndEntry entry : feed.getEntries()) {
                articles.add(toArticleInfo(entry));
            }
            return articles;
        } catch (Exception e) {
            return List.of();
        }
    }

    private List<ArticleInfo> fetchFromApolloState(String blogUrl) {
        try {
            Document doc = Jsoup.connect(encodeNonAscii(blogUrl))
                    .userAgent(USER_AGENT)
                    .header("Accept-Language", "ko-KR,ko;q=0.9,en;q=0.8")
                    .timeout(TIMEOUT_MS)
                    .get();

            Elements scripts = doc.select("script");
            for (Element script : scripts) {
                String data = script.data();
                if (!data.contains("__APOLLO_STATE__")) continue;
                int start = data.indexOf("{");
                int end = data.lastIndexOf("}");
                if (start < 0 || end < 0) continue;
                return parseApolloState(data.substring(start, end + 1));
            }
        } catch (Exception ignored) {}
        return List.of();
    }

    private List<ArticleInfo> parseApolloState(String json) {
        List<ArticleInfo> articles = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(json);
            root.fields().forEachRemaining(entry -> {
                String key = entry.getKey();
                JsonNode node = entry.getValue();
                if (!key.startsWith("Post:")) return;

                String title = node.path("title").asText(null);
                String mediumUrl = node.path("mediumUrl").asText(null);
                if (title == null || mediumUrl == null) return;

                String thumbnail = null;
                JsonNode previewImage = node.path("previewImage");
                if (!previewImage.isMissingNode()) {
                    String imageId = previewImage.path("id").asText(null);
                    if (imageId != null && !imageId.isBlank()) {
                        thumbnail = "https://miro.medium.com/v2/resize:fit:800/" + imageId;
                    }
                }

                String summary = node.path("previewContent").path("subtitle").asText(null);

                LocalDateTime publishedAt = LocalDateTime.now();
                long firstPublishedAt = node.path("firstPublishedAt").asLong(0);
                if (firstPublishedAt > 0) {
                    publishedAt = LocalDateTime.ofEpochSecond(
                            firstPublishedAt / 1000, 0,
                            ZoneId.of("UTC").getRules().getOffset(java.time.Instant.now()));
                }

                articles.add(new ArticleInfo(mediumUrl, title, summary, thumbnail, publishedAt, new String[0]));
            });
        } catch (Exception ignored) {}
        return articles;
    }

    private ArticleInfo toArticleInfo(SyndEntry entry) {
        String summary = null;
        SyndContent desc = entry.getDescription();
        if (desc != null) {
            summary = desc.getValue().replaceAll("<[^>]+>", "").trim();
            if (summary.length() > 500) summary = summary.substring(0, 500);
        }

        LocalDateTime publishedAt = entry.getPublishedDate() != null
                ? entry.getPublishedDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime()
                : LocalDateTime.now();

        String[] tags = entry.getCategories().stream()
                .map(c -> c.getName().trim().toLowerCase())
                .filter(t -> !t.isBlank())
                .distinct().limit(5)
                .toArray(String[]::new);

        return new ArticleInfo(entry.getLink(), entry.getTitle(), summary, null, publishedAt, tags);
    }

    private boolean saveArticle(Company company, ArticleInfo info) {
        if (info.url() == null || info.url().isBlank()) return false;
        if (articleRepository.existsByUrl(info.url())) return false;

        Article article = Article.builder()
                .company(company)
                .title(info.title() != null ? info.title() : "")
                .url(info.url())
                .summary(info.summary())
                .thumbnailUrl(info.thumbnailUrl())
                .publishedAt(info.publishedAt())
                .tags(info.tags())
                .build();

        articleRepository.save(article);
        return true;
    }

    private String encodeNonAscii(String url) {
        StringBuilder sb = new StringBuilder();
        for (char c : url.toCharArray()) {
            if (c > 127) sb.append(URLEncoder.encode(String.valueOf(c), StandardCharsets.UTF_8));
            else sb.append(c);
        }
        return sb.toString();
    }
}
