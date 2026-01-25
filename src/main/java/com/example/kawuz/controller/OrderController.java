package com.example.kawuz.controller;

import com.example.kawuz.entity.Product;
import com.example.kawuz.entity.User;
import com.example.kawuz.repository.UserRepository;
import com.example.kawuz.security.JwtUtil;
import com.example.kawuz.service.EmailService;
import com.example.kawuz.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    /**
     * @brief Konstruktor wstrzykujący wymagane zależności.
     * @param productService Serwis produktów.
     */
    public OrderController(ProductService productService, EmailService emailService, UserRepository userRepository, JwtUtil jwtUtil) {
        this.productService = productService;
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
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
    public ResponseEntity<Map<String, String>>  placeOrder(@RequestBody List<OrderItem> items,
                                             @CookieValue(name = "auth_token", required = false) String token) {

        if (token == null || !jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "order.notLoggedIn"));
        }

        String username = jwtUtil.getUsernameFromToken(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika: " + username));

        //Sprawdzenie dostępności wszystkich produktów
        for (OrderItem item : items) {
            Product product = productService.getProductById(item.getProductId());
            if (product == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "order.productNotFound"));
            }
            if (product.getStockQuantity() < item.getQuantity()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "order.notEnoughStock", "productName", product.getName()));
            }
        }

        for (OrderItem item : items) {
            Product product = productService.getProductById(item.getProductId());
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            product.setSales(product.getSales() + item.getQuantity());
            productService.updateProduct(product, product.getId());
        }

        String summary = buildOrderSummary(items); // możesz użyć swojej metody podsumowania
        emailService.sendOrderEmail(
                user.getEmail(),
                "Podsumowanie zamówienia",
                summary
        );

        return ResponseEntity.ok(Map.of("message", "order.success"));
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
    private String buildOrderSummary(List<OrderItem> items) {
        StringBuilder sb = new StringBuilder();
        sb.append("Twoje zamówienie:\n\n");

        double total = 0;
        for (OrderItem item : items) {
            Product product = productService.getProductById(item.getProductId());
            double price = item.getQuantity() * product.getPrice();
            total += price;
            sb.append(product.getName())
                    .append(" x ")
                    .append(item.getQuantity())
                    .append(" = ")
                    .append(price)
                    .append(" zł\n");
        }

        sb.append("\nŁącznie: ").append(total).append(" zł");
        return sb.toString();
    }

}
