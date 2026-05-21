package com.finfeed.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${logos.directory:./logos}")
    private String logosDirectory;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absolutePath = Paths.get(logosDirectory).toAbsolutePath().toString();
        registry.addResourceHandler("/logos/**")
                .addResourceLocations("file:" + absolutePath + "/");
    }
}
