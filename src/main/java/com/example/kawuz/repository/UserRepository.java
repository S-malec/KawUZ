package com.example.kawuz.repository;

import com.example.kawuz.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * @interface UserRepository
 * @brief Interfejs repozytorium do zarządzania danymi użytkowników.
 * * Zapewnia warstwę abstrakcji nad dostępem do danych w tabeli użytkowników.
 * Rozszerza JpaRepository, co umożliwia wykonywanie standardowych operacji CRUD
 * oraz zapytań automatycznie generowanych przez Spring Data JPA.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * @brief Wyszukuje użytkownika na podstawie jego unikalnej nazwy (loginu).
     * * Metoda wykorzystywana głównie w procesach uwierzytelniania i autoryzacji.
     * * @param username Nazwa użytkownika, którego chcemy odnaleźć.
     * @return Optional<User> Obiekt typu Optional zawierający znalezionego użytkownika
     * lub pusty, jeśli użytkownik o podanym loginie nie istnieje.
     */
    Optional<User> findByUsername(String username);
}