package com.example.kawuz.entity;

import jakarta.persistence.*;

/**
 * @class User
 * @brief Encja bazodanowa reprezentująca użytkownika systemu KawUZ.
 * * Odpowiada za przechowywanie danych uwierzytelniających oraz informacji o uprawnieniach.
 * Mapowana na tabelę "users" w bazie danych.
 */
@Entity
@Table(name = "users")
public class User {
    /** @brief Unikalny identyfikator użytkownika (Klucz podstawowy). */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** @brief Unikalna nazwa użytkownika wykorzystywana do logowania. */
    private String username;
    /** @brief Skrót hasła użytkownika. */
    private String password;
    /** @brief Adres e-mail przypisany do konta. */
    private String email;
    /** @brief Flaga określająca, czy użytkownik posiada uprawnienia administratora. */
    private boolean isAdmin = false;

    /**
     * @brief Domyślny konstruktor bezargumentowy (wymagany przez JPA).
     */
    public User() {}

    /**
     * @brief Pełny konstruktor inicjalizujący wszystkie pola użytkownika.
     * @param username Nazwa użytkownika.
     * @param password Hasło użytkownika.
     * @param email Adres e-mail.
     * @param isAdmin Status administratora.
     */
    public User(String username, String password, String email, boolean isAdmin) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.isAdmin = false;
    }

    /**
     * @brief Konstruktor uproszczony do tworzenia standardowych użytkowników (nie-adminów).
     * @param username Nazwa użytkownika.
     * @param password Hasło użytkownika.
     * @param email Adres e-mail.
     */
    public User(String username, String password, String email) {
        this(username, password, email, false);
    }

    /** @return Long ID użytkownika. */
    public Long getId() { return id; }
    /** @param id Nowe ID użytkownika. */
    public void setId(Long id) { this.id = id; }
    /** @return String Nazwa użytkownika. */
    public String getUsername() { return username; }
    /** @param username Nowa nazwa użytkownika. */
    public void setUsername(String username) { this.username = username; }
    /** @return String Hasło użytkownika. */
    public String getPassword() { return password; }
    /** @param password Nowe hasło użytkownika. */
    public void setPassword(String password) { this.password = password; }
    /** @return String Adres e-mail. */
    public String getEmail() { return email; }
    /** @param email Nowy adres e-mail. */
    public void setEmail(String email) { this.email = email; }
    /** @return boolean True jeśli użytkownik jest administratorem. */
    public boolean isAdmin() { return isAdmin; }
    /** @param admin Nowy status administratora. */
    public void setAdmin(boolean admin) { isAdmin = admin; }
}