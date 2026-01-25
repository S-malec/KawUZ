package com.example.kawuz.controller;

import com.example.kawuz.entity.User;
import com.example.kawuz.repository.UserRepository;
import com.example.kawuz.security.JwtUtil;
import com.example.kawuz.service.CaptchaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * @class AuthController
 * @brief Kontroler odpowiedzialny za uwierzytelnianie i autoryzację użytkowników.
 * * Zarządza procesami logowania, rejestracji oraz sesjami opartymi na tokenach JWT.
 * Wykorzystuje mechanizm ciasteczek HttpOnly do bezpiecznego przechowywania tokenów.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    /** Repozytorium do obsługi operacji na danych użytkowników. */
    @Autowired private UserRepository userRepository;

    /** Narzędzie do generowania i walidacji tokenów JSON Web Token. */
    @Autowired private JwtUtil jwtUtil;

    /** Serwis do weryfikacji tokenów reCAPTCHA. */
    @Autowired private CaptchaService captchaService;

    /**
     * @brief Przeprowadza proces logowania użytkownika.
     * * Weryfikuje token reCAPTCHA, sprawdza poświadczenia w bazie danych
     * i generuje bezpieczne ciasteczko HttpOnly z tokenem JWT.
     * * @param request Obiekt zawierający login, hasło oraz token reCAPTCHA.
     * @return ResponseEntity zawierające dane użytkownika i ciasteczko sesyjne lub błąd 401.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        boolean isHuman = captchaService.verifyCaptcha(request.getRecaptchaToken());
        if (!isHuman) {
            return ResponseEntity.badRequest().body(Map.of("message", "Weryfikacja Captcha nieudana!"));
        }

        Optional<User> existingUser = userRepository.findByUsername(request.getUsername());

        if (existingUser.isPresent() && existingUser.get().getPassword().equals(request.getPassword())) {
            User loggedInUser = existingUser.get();

            String token = jwtUtil.generateToken(loggedInUser.getUsername());

            ResponseCookie cookie = ResponseCookie.from("auth_token", token)
                    .httpOnly(true)
                    .secure(false)
                    .path("/")
                    .maxAge(24 * 60 * 60)
                    .sameSite("Strict")
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(Map.of(
                            "message", "Zalogowano!",
                            "username", loggedInUser.getUsername(),
                            "isAdmin", loggedInUser.isAdmin()
                    ));
        }
        return ResponseEntity.status(401).body(Map.of("message", "Błąd: Zły login lub hasło"));
    }

    /**
     * @brief Wylogowuje użytkownika poprzez unieważnienie ciasteczka autoryzacyjnego.
     * * Ustawia czas życia ciasteczka na 0, co powoduje jego natychmiastowe usunięcie przez przeglądarkę.
     * * @return ResponseEntity z potwierdzeniem wylogowania.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        ResponseCookie cookie = ResponseCookie.from("auth_token", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .build();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(Map.of("message", "Wylogowano"));
    }

    /**
     * @brief Weryfikuje aktualny status zalogowania użytkownika na podstawie ciasteczka.
     * * Pozwala aplikacji frontendowej na odzyskanie danych sesji po odświeżeniu strony.
     * * @param token Wartość tokena pobrana automatycznie z ciasteczka "auth_token".
     * @return ResponseEntity z danymi zalogowanego użytkownika lub status 401 w przypadku braku ważnej sesji.
     */
    @GetMapping("/me")
    public ResponseEntity<?> me(@CookieValue(name = "auth_token", required = false) String token) {
        if (token != null && jwtUtil.validateToken(token)) {
            String username = jwtUtil.getUsernameFromToken(token);
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null) {
                return ResponseEntity.ok(Map.of(
                        "username", user.getUsername(),
                        "isAdmin", user.isAdmin()
                ));
            }
        }
        return ResponseEntity.status(401).build();
    }

    /**
     * @brief Rejestruje nowego użytkownika w systemie.
     * * Sprawdza unikalność loginów oraz weryfikuje token reCAPTCHA przed zapisaniem w bazie danych.
     * * @param request Obiekt zawierający dane nowego konta (login, hasło, email, reCAPTCHA).
     * @return ResponseEntity z potwierdzeniem sukcesu lub błędem walidacji (np. login zajęty).
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        boolean isHuman = captchaService.verifyCaptcha(request.getRecaptchaToken());
        if (!isHuman) {
            return ResponseEntity.badRequest().body(Map.of("message", "Weryfikacja nieudana"));
        }

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Login jest już zajęty!"));
        }

        User newUser = new User();
        newUser.setUsername(request.getUsername());
        newUser.setPassword(request.getPassword());
        newUser.setEmail(request.getEmail());
        newUser.setAdmin(false);

        userRepository.save(newUser);

        return ResponseEntity.ok(Map.of("message", "Zarejestrowano pomyślnie!"));
    }
}