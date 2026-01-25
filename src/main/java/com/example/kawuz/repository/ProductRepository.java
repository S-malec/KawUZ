package com.example.kawuz.repository;

import com.example.kawuz.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * @interface ProductRepository
 * @brief Interfejs repozytorium do obsługi operacji bazodanowych na produktach.
 * * Rozszerza JpaRepository, zapewniając podstawowe operacje CRUD oraz
 * niestandardowe metody wyszukiwania oparte na mechanizmie Spring Data JPA.
 */
public interface ProductRepository extends JpaRepository<Product, Integer> {

    /**
     * @brief Wyszukuje produkty po dokładnej nazwie.
     * @param name Dokładna nazwa produktu.
     * @return Lista znalezionych produktów.
     */
    List<Product> findByName(String name);

    /**
     * @brief Wyszukuje produkty, których nazwa zawiera określoną frazę (wielkość liter nie ma znaczenia).
     * @param keyword Fraza wyszukiwana w nazwie.
     * @return Lista produktów pasujących do kryterium.
     */
    List<Product> findByNameContainingIgnoreCase(String keyword);

    /**
     * @brief Wyszukuje produkty, których opis zawiera określoną frazę (wielkość liter nie ma znaczenia).
     * @param keyword Fraza wyszukiwana w opisie.
     * @return Lista produktów pasujących do kryterium.
     */
    List<Product> findByDescriptionContainingIgnoreCase(String keyword);

    /**
     * @brief Pobiera 10 najlepiej sprzedających się produktów.
     * * Sortuje wyniki malejąco według pola 'sales' i ogranicza wynik do 10 rekordów.
     * @return Lista 10 najczęściej kupowanych produktów.
     */
    List<Product> findTop10ByOrderBySalesDesc();
}