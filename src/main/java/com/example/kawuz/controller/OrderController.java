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

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/order")
public class OrderController {

    private final ProductService productService;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public OrderController(ProductService productService, EmailService emailService, UserRepository userRepository, JwtUtil jwtUtil) {
        this.productService = productService;
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

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

        // Odejmowanie ilości dopiero po sprawdzeniu wszystkich
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
    public static class OrderItem {
        private int productId;
        private int quantity;

        public int getProductId() { return productId; }
        public void setProductId(int productId) { this.productId = productId; }

        public int getQuantity() { return quantity; }
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
