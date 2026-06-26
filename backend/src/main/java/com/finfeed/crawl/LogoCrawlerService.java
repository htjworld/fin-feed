package com.finfeed.crawl;

import com.finfeed.company.Company;
import com.finfeed.company.CompanyRepository;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.List;
import java.util.Map;

@Service
public class LogoCrawlerService {

    private static final Logger log = LoggerFactory.getLogger(LogoCrawlerService.class);

    private static final Map<String, String> CURATED_LOGOS = Map.ofEntries(
            Map.entry("toss",        "https://logo.clearbit.com/toss.im"),
            Map.entry("kakaopay",    "https://logo.clearbit.com/kakaopay.com"),
            Map.entry("naverpay",    "https://logo.clearbit.com/pay.naver.com"),
            Map.entry("banksalad",   "https://logo.clearbit.com/banksalad.com"),
            Map.entry("kakaobank",   "https://logo.clearbit.com/kakaobank.com"),
            Map.entry("k-bank",      "https://logo.clearbit.com/kbanknow.com"),
            Map.entry("dunamu",      "https://logo.clearbit.com/dunamu.com"),
            Map.entry("upbit",       "https://logo.clearbit.com/upbit.com"),
            Map.entry("stripe",      "https://logo.clearbit.com/stripe.com"),
            Map.entry("plaid",       "https://logo.clearbit.com/plaid.com"),
            Map.entry("robinhood",   "https://logo.clearbit.com/robinhood.com"),
            Map.entry("coinbase",    "https://logo.clearbit.com/coinbase.com"),
            Map.entry("binance",     "https://logo.clearbit.com/binance.com"),
            Map.entry("wise",        "https://logo.clearbit.com/wise.com"),
            Map.entry("revolut",     "https://logo.clearbit.com/revolut.com"),
            Map.entry("monzo",       "https://logo.clearbit.com/monzo.com"),
            Map.entry("klaytn",      "https://logo.clearbit.com/kaia.io"),
            Map.entry("bithumb",     "https://logo.clearbit.com/bithumb.com"),
            Map.entry("coinone",     "https://logo.clearbit.com/coinone.co.kr")
    );

    private final CompanyRepository companyRepository;

    @Value("${logos.directory:./logos}")
    private String logosDirectory;

    public LogoCrawlerService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    @Transactional
    public int crawlAllLogos() {
        List<Company> companies = companyRepository.findAll();
        int count = 0;
        for (Company company : companies) {
            if (downloadLogo(company)) count++;
        }
        return count;
    }

    private boolean downloadLogo(Company company) {
        String slug = slugify(company.getNameEn());
        String localPath = "/logos/" + slug + ".";

        String currentUrl = company.getLogoUrl();
        if (currentUrl != null && currentUrl.startsWith("/logos/")) {
            Path existing = Paths.get(logosDirectory).toAbsolutePath().resolve(Paths.get(currentUrl).getFileName());
            if (Files.exists(existing)) return false;
        }

        String[] candidates = {
            CURATED_LOGOS.getOrDefault(slug, null),
            clearbitUrl(company.getSiteUrl()),
            crawlSiteForLogo(company.getSiteUrl()),
            googleFaviconUrl(company.getSiteUrl()),
        };

        byte[] bytes = null;
        String sourceUrl = null;
        String ext = "png";

        for (String candidate : candidates) {
            if (candidate == null || candidate.isBlank()) continue;
            try {
                Connection.Response response = Jsoup.connect(candidate)
                        .userAgent("Mozilla/5.0")
                        .ignoreContentType(true)
                        .timeout(8_000)
                        .execute();
                byte[] b = response.bodyAsBytes();
                if (b != null && b.length > 500) {
                    bytes = b;
                    sourceUrl = candidate;
                    ext = resolveExt(response.contentType(), candidate);
                    break;
                }
            } catch (Exception e) {
                // 후보 URL은 여러 개를 순차 시도하므로 개별 실패는 DEBUG, 다음 후보로 진행
                log.debug("[{}] 로고 후보 다운로드 실패 (candidate={}): {}",
                        company.getNameEn(), candidate, e.getMessage(), e);
            }
        }

        if (bytes == null) {
            log.warn("[{}] 로고 다운로드 실패 — 모든 후보 URL 실패", company.getNameEn());
            return false;
        }

        try {
            String filename = slug + "." + ext;

            Path dir = Paths.get(logosDirectory).toAbsolutePath();
            Files.createDirectories(dir);
            Files.write(dir.resolve(filename), bytes,
                    StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

            company.setLogoUrl("/logos/" + filename);
            companyRepository.save(company);
            return true;
        } catch (Exception e) {
            log.error("[{}] 로고 파일 저장 실패 (sourceUrl={}): {}",
                    company.getNameEn(), sourceUrl, e.getMessage(), e);
            return false;
        }
    }

    private String crawlSiteForLogo(String siteUrl) {
        if (siteUrl == null || siteUrl.isBlank()) return null;
        try {
            Document doc = Jsoup.connect(siteUrl)
                    .userAgent("Mozilla/5.0")
                    .timeout(5_000)
                    .followRedirects(true)
                    .get();
            Element icon = doc.selectFirst("link[rel=apple-touch-icon]");
            if (icon != null) return icon.absUrl("href");
        } catch (Exception e) {
            log.debug("사이트 로고 탐색 실패 (siteUrl={}): {}", siteUrl, e.getMessage(), e);
        }
        return null;
    }

    private String googleFaviconUrl(String siteUrl) {
        if (siteUrl == null) return null;
        try {
            String host = java.net.URI.create(siteUrl).getHost();
            return host != null ? "https://www.google.com/s2/favicons?domain=" + host + "&sz=128" : null;
        } catch (Exception e) {
            return null;
        }
    }

    private String clearbitUrl(String siteUrl) {
        if (siteUrl == null) return null;
        try {
            String host = java.net.URI.create(siteUrl).getHost();
            return host != null ? "https://logo.clearbit.com/" + host : null;
        } catch (Exception e) {
            return null;
        }
    }

    private String resolveExt(String contentType, String url) {
        if (contentType != null) {
            if (contentType.contains("svg")) return "svg";
            if (contentType.contains("png")) return "png";
            if (contentType.contains("jpeg") || contentType.contains("jpg")) return "jpg";
        }
        if (url.contains(".svg")) return "svg";
        if (url.contains(".jpg") || url.contains(".jpeg")) return "jpg";
        return "png";
    }

    private String slugify(String text) {
        if (text == null) return "unknown";
        return text.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }
}
