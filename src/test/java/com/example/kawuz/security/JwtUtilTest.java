package com.example.kawuz.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.security.Key;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
    }

    @Test
    void generateToken_shouldReturnValidJwt() {
        String token = jwtUtil.generateToken("testuser");

        assertNotNull(token);
        assertTrue(token.split("\\.").length == 3); // JWT ma 3 części
    }

    @Test
    void getUsernameFromToken_shouldReturnCorrectUsername() {
        String token = jwtUtil.generateToken("john");

        String username = jwtUtil.getUsernameFromToken(token);

        assertEquals("john", username);
    }

    @Test
    void validateToken_shouldReturnTrue_forValidToken() {
        String token = jwtUtil.generateToken("user");

        boolean valid = jwtUtil.validateToken(token);

        assertTrue(valid);
    }

    @Test
    void validateToken_shouldReturnFalse_forModifiedToken() {
        String token = jwtUtil.generateToken("user");

        // celowo psujemy token
        String modifiedToken = token.substring(0, token.length() - 5) + "abcde";

        boolean valid = jwtUtil.validateToken(modifiedToken);

        assertFalse(valid);
    }

    @Test
    void validateToken_shouldReturnFalse_forEmptyToken() {
        boolean valid = jwtUtil.validateToken("");

        assertFalse(valid);
    }

    @Test
    void validateToken_shouldReturnFalse_forTokenSignedWithDifferentKey() {
        // inny klucz
        Key otherKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);

        String tokenWithOtherKey = Jwts.builder()
                .setSubject("hacker")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 10000))
                .signWith(otherKey)
                .compact();

        boolean valid = jwtUtil.validateToken(tokenWithOtherKey);

        assertFalse(valid);
    }
}
