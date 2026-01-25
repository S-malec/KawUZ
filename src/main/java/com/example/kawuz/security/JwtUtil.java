package com.example.kawuz.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

/**
 * @class JwtUtil
 * @brief Komponent odpowiedzialny za zarządzanie tokenami JSON Web Token (JWT).
 * * Klasa udostępnia mechanizmy generowania, parsowania oraz weryfikacji tokenów,
 * które są wykorzystywane do autoryzacji żądań HTTP w systemie.
 */
@Component
public class JwtUtil {

    /** @brief Klucz tajny używany do podpisywania tokenów (HMAC-SHA). */
    private static final String SECRET = "YourSuperSecretKeyThatMustBeAtLeast32BytesLong12345";

    /** @brief Czas ważności tokena wyrażony w milisekundach (24 godziny). */
    private static final long EXPIRATION_TIME = 86400000;

    /** @brief Obiekt klucza kryptograficznego wygenerowany na podstawie SECRET. */
    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

    /**
     * @brief Generuje nowy token JWT dla podanego użytkownika.
     * * @param username Nazwa użytkownika, dla którego ma zostać wystawiony token.
     * @return String zaszyfrowany token JWT zawierający datę wystawienia i wygaśnięcia.
     */
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * @brief Odczytuje nazwę użytkownika (Subject) z zaszyfrowanego tokena.
     * * @param token Ciąg znaków reprezentujący token JWT.
     * @return String Nazwa użytkownika zapisana wewnątrz tokena.
     */
    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    /**
     * @brief Weryfikuje poprawność i ważność tokena JWT.
     * * Sprawdza, czy token nie został zmodyfikowany oraz czy nie upłynął termin jego ważności.
     * * @param token Token do walidacji.
     * @return boolean True, jeśli token jest poprawny; false w przypadku błędu lub wygaśnięcia.
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}