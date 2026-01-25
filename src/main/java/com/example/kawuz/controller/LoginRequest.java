package com.example.kawuz.controller;

/**
 * @class LoginRequest
 * @brief Klasa modelu transferu danych (DTO) dla żądania logowania.
 * * Służy do mapowania przychodzącego dokumentu JSON na obiekt Javy
 * podczas procesu uwierzytelniania w AuthController.
 */
public class LoginRequest {

    /** @brief Nazwa użytkownika (login) podana w formularzu logowania. */
    private String username;

    /** @brief Hasło użytkownika przesyłane w celu weryfikacji poświadczeń. */
    private String password;

    /** * @brief Token weryfikacyjny wygenerowany przez usługę Google reCAPTCHA.
     * Służy do weryfikacji, czy żądanie zostało wysłane przez człowieka.
     */
    private String recaptchaToken;

    /**
     * @brief Pobiera nazwę użytkownika.
     * @return String zawierający login użytkownika.
     */
    public String getUsername() {
        return username;
    }

    /**
     * @brief Ustawia nazwę użytkownika.
     * @param username Login użytkownika przekazany w żądaniu.
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
     * @param password Hasło podane przez użytkownika.
     */
    public void setPassword(String password) {
        this.password = password;
    }

    /**
     * @brief Pobiera token reCAPTCHA.
     * @return Token weryfikacyjny Google reCAPTCHA.
     */
    public String getRecaptchaToken() {
        return recaptchaToken;
    }

    /**
     * @brief Ustawia token reCAPTCHA.
     * @param recaptchaToken Token wygenerowany przez komponent frontendowy.
     */
    public void setRecaptchaToken(String recaptchaToken) {
        this.recaptchaToken = recaptchaToken;
    }
}