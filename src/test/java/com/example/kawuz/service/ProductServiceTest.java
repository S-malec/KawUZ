package com.example.kawuz.service;

import com.example.kawuz.entity.Product;
import com.example.kawuz.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void getAllProducts_shouldReturnAllProducts() {
        // given
        List<Product> products = List.of(
                new Product(),
                new Product()
        );
        when(productRepository.findAll()).thenReturn(products);

        // when
        List<Product> result = productService.getAllProducts();

        // then
        assertThat(result).hasSize(2);
        verify(productRepository).findAll();
    }

    @Test
    void getProductById_shouldReturnProduct_whenExists() {
        // given
        Product product = new Product();
        product.setId(1);
        when(productRepository.findById(1)).thenReturn(Optional.of(product));

        // when
        Product result = productService.getProductById(1);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1);
    }

    @Test
    void getProductById_shouldReturnNull_whenNotExists() {
        // given
        when(productRepository.findById(1)).thenReturn(Optional.empty());

        // when
        Product result = productService.getProductById(1);

        // then
        assertThat(result).isNull();
    }

    @Test
    void addProduct_shouldSaveAndReturnProduct() {
        // given
        Product product = new Product();
        when(productRepository.save(product)).thenReturn(product);

        // when
        Product result = productService.addProduct(product);

        // then
        assertThat(result).isNotNull();
        verify(productRepository).save(product);
    }

    @Test
    void updateProduct_shouldSetIdAndSave() {
        // given
        Product product = new Product();
        when(productRepository.save(any(Product.class))).thenAnswer(i -> i.getArgument(0));

        // when
        Product result = productService.updateProduct(product, 5);

        // then
        assertThat(result.getId()).isEqualTo(5);
        verify(productRepository).save(product);
    }

    @Test
    void deleteProduct_shouldCallRepository() {
        // when
        productService.deleteProduct(3);

        // then
        verify(productRepository).deleteById(3);
    }

    @Test
    void searchProducts_shouldReturnMatchingProducts() {
        // given
        List<Product> products = List.of(new Product());
        when(productRepository.findByNameContainingIgnoreCase("phone"))
                .thenReturn(products);

        // when
        List<Product> result = productService.searchProducts("phone");

        // then
        assertThat(result).hasSize(1);
        verify(productRepository).findByNameContainingIgnoreCase("phone");
    }

    @Test
    void getTop10Products_shouldReturnTopProducts() {
        // given
        List<Product> products = List.of(new Product(), new Product());
        when(productRepository.findTop10ByOrderBySalesDesc())
                .thenReturn(products);

        // when
        List<Product> result = productService.getTop10Products();

        // then
        assertThat(result).hasSize(2);
        verify(productRepository).findTop10ByOrderBySalesDesc();
    }
}
