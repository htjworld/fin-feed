package com.finfeed.crawl;

import com.finfeed.company.Company;
import com.finfeed.company.CompanyRepository;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LogoCrawlerService {

    private final CompanyRepository companyRepository;

    public LogoCrawlerService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    private static final Map<String, String> PREMIUM_LOGOS = new HashMap<>();

    static {
        // Curated, 100% official high-resolution, crystal-clear PNG/SVG logo URLs
        PREMIUM_LOGOS.put("naverpay", "https://upload.wikimedia.org/wikipedia/commons/e/e0/Naver_Pay_logo.png");
        PREMIUM_LOGOS.put("kakaopay", "https://upload.wikimedia.org/wikipedia/commons/f/f2/KakaoPay_logo.svg");
        PREMIUM_LOGOS.put("toss", "https://upload.wikimedia.org/wikipedia/commons/b/b3/Toss.svg");
        PREMIUM_LOGOS.put("kakaobank", "https://upload.wikimedia.org/wikipedia/commons/e/eb/KakaoBank_logo.svg");
        PREMIUM_LOGOS.put("banksalad", "https://logo.clearbit.com/banksalad.com");
        PREMIUM_LOGOS.put("stripe", "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg");
        PREMIUM_LOGOS.put("plaid", "https://upload.wikimedia.org/wikipedia/commons/0/0c/Plaid_logo.svg");
        PREMIUM_LOGOS.put("robinhood", "https://upload.wikimedia.org/wikipedia/commons/c/c8/Robinhood_Logo.svg");
        PREMIUM_LOGOS.put("coinbase", "https://upload.wikimedia.org/wikipedia/commons/1/15/Coinbase_Logo.svg");
        PREMIUM_LOGOS.put("binance", "https://upload.wikimedia.org/wikipedia/commons/5/57/Binance_Logo.svg");
        PREMIUM_LOGOS.put("wise", "https://upload.wikimedia.org/wikipedia/commons/7/78/Wise_Logo.svg");
        PREMIUM_LOGOS.put("revolut", "https://upload.wikimedia.org/wikipedia/commons/8/82/Revolut_logo.svg");
        PREMIUM_LOGOS.put("monzo", "https://upload.wikimedia.org/wikipedia/commons/e/ed/Monzo_logo.svg");
        PREMIUM_LOGOS.put("upbit", "https://upload.wikimedia.org/wikipedia/commons/a/ad/Upbit_logo.png");
        PREMIUM_LOGOS.put("bithumb", "https://upload.wikimedia.org/wikipedia/commons/c/ca/Bithumb_logo.png");
        PREMIUM_LOGOS.put("coinone", "https://upload.wikimedia.org/wikipedia/commons/5/5f/Coinone_logo.png");
        PREMIUM_LOGOS.put("klaytn", "https://upload.wikimedia.org/wikipedia/commons/8/87/Klaytn_Logo.svg");
    }

    @Transactional
    public int crawlAllLogos() {
        List<Company> companies = companyRepository.findAll();
        int count = 0;
        for (Company company : companies) {
            String key = company.getNameEn().toLowerCase().replaceAll("\\s+", "");
            String logoUrl = PREMIUM_LOGOS.get(key);

            if (logoUrl == null) {
                // Try dynamic Jsoup HTML crawling to find high-quality brand touch-icons or logos
                logoUrl = crawlFromWebsite(company.getSiteUrl());
            }

            if (logoUrl == null || logoUrl.isBlank()) {
                // Try high-quality Clearbit Logo API CDN as fallback
                logoUrl = getClearbitLogoUrl(company.getSiteUrl());
            }

            if (logoUrl != null && !logoUrl.isBlank()) {
                company.setLogoUrl(logoUrl);
                companyRepository.save(company);
                count++;
            }
        }
        return count;
    }

    private String crawlFromWebsite(String siteUrl) {
        if (siteUrl == null || siteUrl.isBlank()) return null;
        try {
            Document doc = Jsoup.connect(siteUrl)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .timeout(5000)
                    .followRedirects(true)
                    .get();

            // 1. Check for Apple Touch Icon (high-resolution PNG brand asset)
            Element appleIcon = doc.selectFirst("link[rel=apple-touch-icon]");
            if (appleIcon != null) {
                String href = appleIcon.absUrl("href");
                if (href != null && !href.isBlank()) {
                    return href;
                }
            }

            // 2. Check for large shortcut icon or standard icon PNG
            Element icon = doc.selectFirst("link[rel~=(?i)^(shortcut|icon|shortcut icon)$][href$=png]");
            if (icon != null) {
                String href = icon.absUrl("href");
                if (href != null && !href.isBlank()) {
                    return href;
                }
            }

            // 3. Check og:image if it might represent a logo on the homepage
            Element ogImage = doc.selectFirst("meta[property=og:image]");
            if (ogImage != null) {
                String content = ogImage.attr("content");
                if (content != null && !content.isBlank() && (content.contains("logo") || content.contains("brand") || content.contains("ci"))) {
                    return content.trim();
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to crawl logo from site: " + siteUrl + ", error: " + e.getMessage());
        }
        return null;
    }

    private String getClearbitLogoUrl(String siteUrl) {
        if (siteUrl == null || siteUrl.isBlank()) return null;
        try {
            // Extract core domain
            String domain = siteUrl.replaceAll("https?://(www\\.)?", "").replaceAll("/.*", "");
            if (domain.endsWith("naver.com")) {
                // Skip generic Naver domain to prevent mislabeling Naver Pay
                return null;
            }
            return "https://logo.clearbit.com/" + domain;
        } catch (Exception e) {
            return null;
        }
    }
}
