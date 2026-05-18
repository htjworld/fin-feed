package com.finfeed.common;

import com.finfeed.article.Article;
import com.finfeed.article.ArticleRepository;
import com.finfeed.company.Company;
import com.finfeed.company.CompanyRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.List;

@Component
@Profile("local")
public class LocalDataInitializer implements CommandLineRunner {

    private final CompanyRepository companyRepository;
    private final ArticleRepository articleRepository;

    @PersistenceContext
    private EntityManager em;

    public LocalDataInitializer(CompanyRepository companyRepository,
                                ArticleRepository articleRepository) {
        this.companyRepository = companyRepository;
        this.articleRepository = articleRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        List<Company> companies = insertCompanies();
        insertArticles(companies);
    }

    private List<Company> insertCompanies() {
        String[] names       = {"토스", "카카오뱅크", "업비트", "Stripe", "두나무"};
        String[] nameEns     = {"Toss", "KakaoBank", "Upbit", "Stripe", "Dunamu"};
        String[] siteUrls    = {"https://toss.tech", "https://tech.kakaobank.com",
                                "https://medium.com/두나무", "https://stripe.com/blog/engineering",
                                "https://medium.com/두나무-기술블로그"};
        Sector[] sectors     = {Sector.DOMESTIC_FINTECH, Sector.DOMESTIC_BANK,
                                Sector.CRYPTO, Sector.GLOBAL_FINTECH, Sector.DOMESTIC_SECURITIES};

        for (int i = 0; i < names.length; i++) {
            em.createNativeQuery("""
                    INSERT INTO companies (name, name_en, site_url, sector, is_active)
                    VALUES (?, ?, ?, ?, true)
                    """)
                    .setParameter(1, names[i])
                    .setParameter(2, nameEns[i])
                    .setParameter(3, siteUrls[i])
                    .setParameter(4, sectors[i].getValue())
                    .executeUpdate();
        }
        em.flush();
        return companyRepository.findAll();
    }

    private void insertArticles(List<Company> companies) {
        String[][] data = {
                {"토스의 점진적 마이크로서비스 전환", "https://toss.tech/article/msa", "infra,backend"},
                {"카카오뱅크 대용량 트래픽 처리 전략", "https://tech.kakaobank.com/posts/traffic", "infra,backend"},
                {"업비트 거래 시스템 고가용성 설계", "https://medium.com/두나무/ha", "infra,trading"},
                {"Stripe의 결제 API 설계 원칙", "https://stripe.com/blog/payments-api", "payment,infra"},
                {"두나무 블록체인 기술 스택 소개", "https://medium.com/두나무/blockchain", "blockchain,infra"},
                {"토스 보안 인증 시스템 개선기", "https://toss.tech/article/security", "security,backend"},
                {"카카오뱅크 데이터 파이프라인 구축", "https://tech.kakaobank.com/posts/data", "data,infra"},
                {"업비트 실시간 호가 시스템", "https://medium.com/두나무/realtime", "trading,backend"},
        };

        for (String[] row : data) {
            Company company = companies.stream()
                    .filter(c -> row[1].contains(simplifyDomain(c.getSiteUrl())))
                    .findFirst()
                    .orElse(companies.getFirst());

            Article article = Article.builder()
                    .company(company)
                    .title(row[0])
                    .url(row[1])
                    .summary(row[0] + " - 상세 내용입니다.")
                    .tags(row[2].split(","))
                    .publishedAt(LocalDateTime.now().minusDays((long) (Math.random() * 30)))
                    .build();

            articleRepository.save(article);
        }
    }

    private String simplifyDomain(String url) {
        if (url.contains("toss")) return "toss";
        if (url.contains("kakaobank")) return "kakaobank";
        if (url.contains("stripe")) return "stripe";
        if (url.contains("두나무")) return "두나무";
        return url;
    }
}
