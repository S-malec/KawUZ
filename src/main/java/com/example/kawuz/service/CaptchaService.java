package com.example.kawuz.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import java.util.Map;

@Service
public class CaptchaService {

    private static final String SECRET_KEY = "6LeAQ1UsAAAAAEZGRomsIOUorarCZiQwHAaFnYDi";
    private static final String GOOGLE_API = "https://www.google.com/recaptcha/api/siteverify";

    public boolean verifyCaptcha(String token) {
        if (token == null || token.isEmpty()) return false;

        RestTemplate restTemplate = new RestTemplate();
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("secret", SECRET_KEY);
        params.add("response", token);

        try {
            Map response = restTemplate.postForObject(GOOGLE_API, params, Map.class);
            return response != null && (Boolean) response.get("success");
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
