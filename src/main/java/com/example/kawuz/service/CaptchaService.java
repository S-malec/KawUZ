package com.example.kawuz.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import java.util.Map;

/**
 * @class CaptchaService
 * @brief Serwis odpowiedzialny za weryfikację zabezpieczeń reCAPTCHA.
 * * Klasa komunikuje się z serwerami Google w celu potwierdzenia, że żądania
 * przesyłane do API (np. logowanie, rejestracja) pochodzą od człowieka, a nie od bota.
 */
@Service
public class CaptchaService {

    /** @brief Klucz prywatny (Secret Key) do uwierzytelniania w usłudze Google reCAPTCHA. */
    private static final String SECRET_KEY = "6LeAQ1UsAAAAAEZGRomsIOUorarCZiQwHAaFnYDi";

    /** @brief Adres URL punktu końcowego API Google służącego do weryfikacji tokenów. */
    private static final String GOOGLE_API = "https://www.google.com/recaptcha/api/siteverify";

    /**
     * @brief Weryfikuje token reCAPTCHA otrzymany z frontendu.
     * * Wysyła zapytanie POST do Google API wraz z kluczem tajnym i tokenem użytkownika.
     * Na podstawie odpowiedzi (field "success") określa wynik walidacji.
     * * @param token Ciąg znaków wygenerowany przez widżet reCAPTCHA na stronie klienta.
     * @return boolean True, jeśli weryfikacja przebiegła pomyślnie; false w przeciwnym razie lub w przypadku błędu połączenia.
     */
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