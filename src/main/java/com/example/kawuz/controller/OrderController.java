package com.example.kawuz.controller;

import com.example.kawuz.entity.Product;
import com.example.kawuz.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @class OrderController
 * @brief Kontroler obsługujący procesy składania zamówień w sklepie.
 * * Odpowiada za przyjmowanie koszyka zakupowego, weryfikację dostępności towaru
 * oraz aktualizację stanów magazynowych i statystyk sprzedaży.
 */
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/order")
public class OrderController {

    /** Serwis do zarządzania produktami i ich stanami magazynowymi. */
    private final ProductService productService;

    /**
     * @brief Konstruktor wstrzykujący wymagane zależności.
     * @param productService Serwis produktów.
     */
    public OrderController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * @brief Tworzy nowe zamówienie i aktualizuje stany magazynowe.
     * * Proces przebiega w dwóch fazach:
     * 1. Walidacja: Sprawdzenie czy wszystkie produkty istnieją i czy ich ilość jest wystarczająca.
     * 2. Realizacja: Odjęcie zakupionej ilości od stanu magazynowego i zwiększenie licznika sprzedaży.
     * * @param items Lista obiektów OrderItem reprezentujących zawartość koszyka.
     * @return ResponseEntity<String> Komunikat o sukcesie lub błąd (404 jeśli brak produktu, 400 jeśli brak zapasów).
     */
    @PostMapping("/create")
    public ResponseEntity<String> placeOrder(@RequestBody List<OrderItem> items) {
        for (OrderItem item : items) {
            Product product = productService.getProductById(item.getProductId());
            if (product == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Nie znaleziono produktu: " + item.getProductId());
            }
            if (product.getStockQuantity() < item.getQuantity()) {
                return ResponseEntity.badRequest()
                        .body("Nie ma wystarczającej liczby produktu: " + product.getName());
            }
        }

        for (OrderItem item : items) {
            Product product = productService.getProductById(item.getProductId());
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            product.setSales(product.getSales() + item.getQuantity());
            productService.updateProduct(product, product.getId());
        }

        return ResponseEntity.ok("Zamówienie zostało złożone!");
    }

    /**
     * @class OrderItem
     * @brief Klasa wewnętrzna reprezentująca pojedynczą pozycję w zamówieniu.
     */
    public static class OrderItem {
        /** ID zamawianego produktu. */
        private int productId;
        /** Zamawiana ilość produktu. */
        private int quantity;

        /** @return ID produktu. */
        public int getProductId() { return productId; }
        /** @param productId Nowe ID produktu. */
        public void setProductId(int productId) { this.productId = productId; }

        /** @return Zamawiana ilość. */
        public int getQuantity() { return quantity; }
        /** @param quantity Nowa ilość. */
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }
}