package com.finfeed.company;

import com.finfeed.company.dto.CompanyResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public List<CompanyResponse> findAll(String sector) {
        List<Object[]> rows = sector == null
                ? companyRepository.findAllWithArticleCount()
                : companyRepository.findAllWithArticleCountBySector(sector);
        return rows.stream().map(CompanyResponse::of).toList();
    }
}
