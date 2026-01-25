package com.example.kawuz.repository;

import com.example.kawuz.entity.Product;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();

        productRepository.saveAll(List.of(
                createProduct("Kawa Arabica", "Delikatna kawa ziarnista", 120),
                createProduct("Kawa Robusta", "Mocna kawa o intensywnym smaku", 250),
                createProduct("Herbata Zielona", "Zdrowa herbata liściasta", 80)
        ));
    }

    @Test
    void shouldSaveProductsCorrectly() {
        List<Product> products = productRepository.findAll();

        assertThat(products).hasSize(3);
        assertThat(products).allMatch(p -> p.getId() > 0);
    }

    @Test
    void shouldFindProductByExactName() {
        List<Product> result = productRepository.findByName("Kawa Arabica");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Kawa Arabica");
    }

    @Test
    void shouldReturnEmptyListWhenNameNotFound() {
        List<Product> result = productRepository.findByName("Nieistniejący produkt");

        assertThat(result).isEmpty();
    }

    @Test
    void shouldFindProductsByNameContainingIgnoreCase() {
        List<Product> result = productRepository.findByNameContainingIgnoreCase("kawa");

        assertThat(result)
                .hasSize(2)
                .extracting(Product::getName)
                .containsExactlyInAnyOrder("Kawa Arabica", "Kawa Robusta");
    }

    @Test
    void shouldFindProductsByDescriptionContainingIgnoreCase() {
        List<Product> result =
                productRepository.findByDescriptionContainingIgnoreCase("INTENSYWNYM");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Kawa Robusta");
    }

    @Test
    void shouldReturnTop10ProductsOrderedBySalesDesc() {
        List<Product> result = productRepository.findTop10ByOrderBySalesDesc();

        assertThat(result).hasSize(3);
        assertThat(result)
                .extracting(Product::getSales)
                .isSortedAccordingTo((a, b) -> b - a);

        assertThat(result.get(0).getName()).isEqualTo("Kawa Robusta");
    }

    @Test
    void shouldReturnOnlyTop10ProductsWhenMoreExist() {
        for (int i = 0; i < 15; i++) {
            productRepository.save(
                    createProduct("Testowa Kawa " + i, "Opis", i)
            );
        }

        List<Product> result = productRepository.findTop10ByOrderBySalesDesc();

        assertThat(result).hasSize(10);
    }

    // ---------- helper ----------

    private Product createProduct(String name, String description, int sales) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setSales(sales);
        product.setProductAvailable(true);
        product.setPrice(20.0);
        product.setStockQuantity(10);
        return product;
    }
}
