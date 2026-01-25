package com.example.kawuz.controller;

import com.example.kawuz.entity.Product;
import com.example.kawuz.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
@Import(ProductControllerTest.TestConfig.class)
@AutoConfigureMockMvc(addFilters = false)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductService productService;

    @Autowired
    private ObjectMapper objectMapper;

    @TestConfiguration
    static class TestConfig {

        @Bean
        ProductService productService() {
            return Mockito.mock(ProductService.class);
        }
    }

    // ---------- helpers ----------

    private Product createProduct(int id, String name) {
        Product p = new Product();
        p.setId(id);
        p.setName(name);
        p.setPrice(25.99);
        p.setProductAvailable(true);
        p.setStockQuantity(10);
        return p;
    }

    // ---------- GET ALL ----------

    @Test
    void shouldReturnAllProducts() throws Exception {
        given(productService.getAllProducts())
                .willReturn(List.of(
                        createProduct(1, "Kawa Arabica"),
                        createProduct(2, "Kawa Robusta")
                ));

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].name").value("Kawa Arabica"));
    }

    // ---------- GET BY ID ----------

    @Test
    void shouldReturnProductById() throws Exception {
        given(productService.getProductById(1))
                .willReturn(createProduct(1, "Kawa Arabica"));

        mockMvc.perform(get("/api/product/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Kawa Arabica"));
    }

    @Test
    void shouldReturn404WhenProductNotFound() throws Exception {
        given(productService.getProductById(99)).willReturn(null);

        mockMvc.perform(get("/api/product/99"))
                .andExpect(status().isNotFound());
    }

    // ---------- CREATE ----------

    @Test
    void shouldCreateProduct() throws Exception {
        Product input = createProduct(0, "Nowa Kawa");
        Product saved = createProduct(1, "Nowa Kawa");

        given(productService.addProduct(any(Product.class)))
                .willReturn(saved);

        mockMvc.perform(post("/api/product")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Nowa Kawa"));
    }

    // ---------- UPDATE ----------

    @Test
    void shouldUpdateProduct() throws Exception {
        Product updated = createProduct(1, "Zmieniona Kawa");

        given(productService.updateProduct(any(Product.class), eq(1)))
                .willReturn(updated);

        mockMvc.perform(put("/api/product/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(content().string("Updated"));
    }

    @Test
    void shouldReturnBadRequestWhenUpdateFails() throws Exception {
        given(productService.updateProduct(any(Product.class), eq(1)))
                .willReturn(null);

        mockMvc.perform(put("/api/product/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new Product())))
                .andExpect(status().isBadRequest());
    }

    // ---------- DELETE ----------

    @Test
    void shouldDeleteProduct() throws Exception {
        given(productService.getProductById(1))
                .willReturn(createProduct(1, "Kawa Arabica"));

        mockMvc.perform(delete("/api/product/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Deleted"));
    }

    @Test
    void shouldReturn404WhenDeletingMissingProduct() throws Exception {
        given(productService.getProductById(1)).willReturn(null);

        mockMvc.perform(delete("/api/product/1"))
                .andExpect(status().isNotFound());
    }

    // ---------- SEARCH ----------

    @Test
    void shouldSearchProducts() throws Exception {
        given(productService.searchProducts("kawa"))
                .willReturn(List.of(createProduct(1, "Kawa Arabica")));

        mockMvc.perform(get("/api/product/search")
                        .param("keyword", "kawa"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Kawa Arabica"));
    }

    // ---------- TOP 10 ----------

    @Test
    void shouldReturnTop10Products() throws Exception {
        given(productService.getTop10Products())
                .willReturn(List.of(createProduct(1, "Top Kawa")));

        mockMvc.perform(get("/api/product/top10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Top Kawa"));
    }

    // ---------- PDF ----------

    @Test
    void shouldReturn404WhenGeneratingPdfForMissingProduct() throws Exception {
        given(productService.getProductById(1)).willReturn(null);

        mockMvc.perform(get("/api/product/1/pdf"))
                .andExpect(status().isNotFound());
    }
}
