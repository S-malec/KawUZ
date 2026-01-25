package com.example.kawuz.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

/**
 * @class SecurityConfig
 * @brief Klasa konfiguracyjna bezpieczeństwa aplikacji.
 * * Odpowiada za definicję reguł dostępu do zasobów HTTP, konfigurację filtrów
 * oraz ustawienia polityki CORS (Cross-Origin Resource Sharing).
 */
@Configuration
public class SecurityConfig {

    /**
     * @brief Definiuje główny łańcuch filtrów bezpieczeństwa (Security Filter Chain).
     * * Konfiguruje wyłączenie ochrony CSRF, integruje ustawienia CORS oraz
     * określa uprawnienia dla poszczególnych ścieżek API.
     * * @param http Obiekt pozwalający na konfigurację bezpieczeństwa na poziomie zapytań HTTP.
     * @return SecurityFilterChain Skonfigurowany łańcuch filtrów.
     * @throws Exception W przypadku błędów konfiguracji.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/api/products/**", "/api/product/**").permitAll()
                        .anyRequest().permitAll()
                );
        return http.build();
    }

    /**
     * @brief Konfiguruje źródło ustawień CORS dla aplikacji.
     * * Definiuje dozwolone pochodzenia (origins), metody HTTP oraz nagłówki.
     * Umożliwia również przesyłanie poświadczeń (cookies) między frontendem a backendem.
     * * @return UrlBasedCorsConfigurationSource Obiekt zawierający mapowanie reguł CORS.
     */
    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}