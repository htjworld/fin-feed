package com.finfeed.company;

import com.finfeed.company.dto.CompanyResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

@ExtendWith(MockitoExtension.class)
class CompanyServiceTest {

    @Mock
    private CompanyRepository companyRepository;

    private CompanyService companyService;

    @BeforeEach
    void setUp() {
        companyService = new CompanyService(companyRepository);
    }

    @Test
    @SuppressWarnings("unchecked")
    void findAll_withNoSectorCallsGlobalQuery() {
        List<Object[]> rows = sampleRows();
        given(companyRepository.findAllWithArticleCount()).willReturn(rows);

        List<CompanyResponse> result = companyService.findAll(null);

        assertThat(result).hasSize(2);
        verify(companyRepository).findAllWithArticleCount();
        verifyNoMoreInteractions(companyRepository);
    }

    @Test
    @SuppressWarnings("unchecked")
    void findAll_withSectorCallsSectorQuery() {
        List<Object[]> rows = sampleRows();
        given(companyRepository.findAllWithArticleCountBySector("crypto")).willReturn(rows);

        List<CompanyResponse> result = companyService.findAll("crypto");

        assertThat(result).hasSize(2);
        verify(companyRepository).findAllWithArticleCountBySector("crypto");
        verifyNoMoreInteractions(companyRepository);
    }

    @Test
    @SuppressWarnings("unchecked")
    void findAll_mapsRowsCorrectly() {
        List<Object[]> rows = List.<Object[]>of(new Object[]{1L, "업비트", "Upbit", null, "https://upbit.com", "crypto", 112L});
        given(companyRepository.findAllWithArticleCount()).willReturn(rows);

        List<CompanyResponse> result = companyService.findAll(null);

        CompanyResponse company = result.getFirst();
        assertThat(company.id()).isEqualTo(1L);
        assertThat(company.name()).isEqualTo("업비트");
        assertThat(company.nameEn()).isEqualTo("Upbit");
        assertThat(company.sector()).isEqualTo("crypto");
        assertThat(company.articleCount()).isEqualTo(112L);
    }

    @Test
    @SuppressWarnings("unchecked")
    void findAll_returnsEmptyListWhenNoCompanies() {
        given(companyRepository.findAllWithArticleCount()).willReturn(List.of());

        List<CompanyResponse> result = companyService.findAll(null);

        assertThat(result).isEmpty();
    }

    private List<Object[]> sampleRows() {
        return List.<Object[]>of(
                new Object[]{1L, "업비트", "Upbit", null, "https://upbit.com", "crypto", 112L},
                new Object[]{2L, "토스", "Toss", null, "https://toss.tech", "domestic_fintech", 184L}
        );
    }
}
