package com.example.kawuz.controller;

/**
 * @class RegisterRequest
 * @brief Klasa modelu transferu danych (DTO) dla żądania rejestracji nowego użytkownika.
 * * Zawiera niezbędne informacje wymagane do założenia konta w systemie KawUZ,
 * w tym dane uwierzytelniające oraz token bezpieczeństwa reCAPTCHA.
 */
public class RegisterRequest {
    /** @brief Unikalna nazwa użytkownika (login) wybierana podczas rejestracji. */
    private String username;
    /** @brief Hasło użytkownika (przesyłane w formie jawnej, wymagane szyfrowanie na poziomie transportu). */
    private String password;
    /** @brief Adres e-mail użytkownika do kontaktu i powiadomień. */
    private String email;
    /** @brief Token weryfikacyjny Google reCAPTCHA służący do blokowania automatycznych rejestracji (botów). */
    private String recaptchaToken;

    /**
     * @brief Pobiera nazwę użytkownika.
     * @return String zawierający login.
     */
    public String getUsername() {
        return username;
    }
    /**
     * @brief Ustawia nazwę użytkownika.
     * @param username Nowa nazwa użytkownika.
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * @brief Pobiera hasło użytkownika.
     * @return String zawierający hasło.
     */
    public String getPassword() {
        return password;
    }
    /**
     * @brief Ustawia hasło użytkownika.
     * @param password Nowe hasło.
     */
    public void setPassword(String password) {
        this.password = password;
    }

    /**
     * @brief Pobiera adres e-mail.
     * @return String z adresem e-mail.
     */
    public String getEmail() {
        return email;
    }
    /**
     * @brief Ustawia adres e-mail.
     * @param email Nowy adres e-mail.
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * @brief Pobiera token reCAPTCHA.
     * @return Token weryfikacyjny.
     */
    public String getRecaptchaToken() {
        return recaptchaToken;
    }
    /**
     * @brief Ustawia token reCAPTCHA.
     * @param recaptchaToken Token wygenerowany przez frontend.
     */
    public void setRecaptchaToken(String recaptchaToken) {
        this.recaptchaToken = recaptchaToken;
    }
}