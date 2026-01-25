package com.example.kawuz.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedConstruction;
import org.mockito.Mockito;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class CaptchaServiceTest {

    private CaptchaService captchaService;

    @BeforeEach
    void setUp() {
        captchaService = new CaptchaService();
    }

    @Test
    void verifyCaptcha_shouldReturnTrue_whenGoogleReturnsSuccessTrue() {
        try (MockedConstruction<RestTemplate> mocked =
                     Mockito.mockConstruction(RestTemplate.class,
                             (mock, context) ->
                                     when(mock.postForObject(anyString(), any(), eq(Map.class)))
                                             .thenReturn(Map.of("success", true))
                     )) {

            boolean result = captchaService.verifyCaptcha("valid-token");

            assertTrue(result);
        }
    }

    @Test
    void verifyCaptcha_shouldReturnFalse_whenGoogleReturnsSuccessFalse() {
        try (MockedConstruction<RestTemplate> mocked =
                     Mockito.mockConstruction(RestTemplate.class,
                             (mock, context) ->
                                     when(mock.postForObject(anyString(), any(), eq(Map.class)))
                                             .thenReturn(Map.of("success", false))
                     )) {

            boolean result = captchaService.verifyCaptcha("invalid-token");

            assertFalse(result);
        }
    }

    @Test
    void verifyCaptcha_shouldReturnFalse_whenGoogleReturnsNull() {
        try (MockedConstruction<RestTemplate> mocked =
                     Mockito.mockConstruction(RestTemplate.class,
                             (mock, context) ->
                                     when(mock.postForObject(anyString(), any(), eq(Map.class)))
                                             .thenReturn(null)
                     )) {

            boolean result = captchaService.verifyCaptcha("token");

            assertFalse(result);
        }
    }

    @Test
    void verifyCaptcha_shouldReturnFalse_whenExceptionThrown() {
        try (MockedConstruction<RestTemplate> mocked =
                     Mockito.mockConstruction(RestTemplate.class,
                             (mock, context) ->
                                     when(mock.postForObject(anyString(), any(), eq(Map.class)))
                                             .thenThrow(new RuntimeException("Google API down"))
                     )) {

            boolean result = captchaService.verifyCaptcha("token");

            assertFalse(result);
        }
    }

    @Test
    void verifyCaptcha_shouldReturnFalse_whenTokenIsNull() {
        boolean result = captchaService.verifyCaptcha(null);

        assertFalse(result);
    }

    @Test
    void verifyCaptcha_shouldReturnFalse_whenTokenIsEmpty() {
        boolean result = captchaService.verifyCaptcha("");

        assertFalse(result);
    }
}
