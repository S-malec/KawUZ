package com.example.kawuz;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * @class KawUzApplication
 * @brief Główna klasa konfiguracyjna i startowa aplikacji sklepu z kawą KawUZ.
 * * Klasa odpowiada za zainicjowanie kontekstu Spring Boot, automatyczną konfigurację
 * komponentów oraz uruchomienie wbudowanego serwera aplikacji.
 */
@SpringBootApplication
public class KawUzApplication {

    /**
     * Punkt wejścia aplikacji (Entry Point).
     * * Metoda statyczna uruchamiająca proces ładowania całego frameworka Spring.
     * * @param args Tablica argumentów przekazywanych z wiersza poleceń podczas startu.
     */
    public static void main(String[] args) {
        SpringApplication.run(KawUzApplication.class, args);
    }

}