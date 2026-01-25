package com.example.kawuz.service;

import com.example.kawuz.entity.Product;
import com.example.kawuz.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @class ProductService
 * @brief Serwis realizujący logikę biznesową dla produktów.
 * * Odpowiada za zarządzanie asortymentem kaw, w tym za operacje CRUD,
 * wyszukiwanie produktów oraz pobieranie statystyk sprzedaży.
 */
@Service
public class ProductService {
    /** @brief Repozytorium produktów wykorzystywane do operacji na bazie danych. */
    ProductRepository productRepository;

    /**
     * @brief Konstruktor wstrzykujący repozytorium produktów.
     * @param productRepository Repozytorium do komunikacji z bazą danych.
     */
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * @brief Pobiera listę wszystkich produktów z bazy danych.
     * @return List<Product> Lista wszystkich produktów.
     */
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    /**
     * @brief Wyszukuje produkt na podstawie unikalnego identyfikatora.
     * @param id ID produktu.
     * @return Product Znaleziony obiekt produktu lub null, jeśli nie istnieje.
     */
    public Product getProductById(int id) {
        return productRepository.findById(id).orElse(null);
    }

    /**
     * @brief Dodaje nowy produkt do systemu.
     * @param product Obiekt produktu do zapisania.
     * @return Product Zapisany obiekt produktu wraz z nadanym ID.
     */
    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    /**
     * @brief Aktualizuje dane istniejącego produktu.
     * * Metoda ustawia przekazane ID w obiekcie produktu przed zapisem,
     * co powoduje aktualizację rekordu zamiast utworzenia nowego.
     * * @param product Obiekt z nowymi danymi produktu.
     * @param id ID produktu, który ma zostać zaktualizowany.
     * @return Product Zaktualizowany obiekt produktu.
     */
    public Product updateProduct(Product product, int id) {
        product.setId(id);
        return productRepository.save(product);
    }

    /**
     * @brief Usuwa produkt z systemu na podstawie ID.
     * @param id ID produktu do usunięcia.
     */
    public void deleteProduct(int id) {
        productRepository.deleteById(id);
    }

    /**
     * @brief Wyszukuje produkty, których nazwa zawiera podane słowo kluczowe.
     * * Metoda nie bierze pod uwagę wielkości liter.
     * * @param keyword Fraza wyszukiwana w nazwach produktów.
     * @return List<Product> Lista produktów spełniających kryteria.
     */
    public List<Product> searchProducts(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword);
    }

    /**
     * @brief Pobiera zestawienie 10 najczęściej kupowanych kaw.
     * @return List<Product> Lista 10 produktów o najwyższej sprzedaży.
     */
    public List<Product> getTop10Products() {
        return productRepository.findTop10ByOrderBySalesDesc();
    }

}