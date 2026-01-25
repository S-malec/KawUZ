package com.example.kawuz.service;

import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Transport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmailServiceTest {

    private EmailService emailService;

    @BeforeEach
    void setUp() {
        emailService = new EmailService();

        // symulujemy @Value
        ReflectionTestUtils.setField(emailService, "email", "test@gmail.com");
        ReflectionTestUtils.setField(emailService, "password", "password");
    }

    @Test
    void sendOrderEmail_shouldSendEmailSuccessfully() {
        try (MockedStatic<Transport> transportMock = mockStatic(Transport.class)) {

            transportMock.when(() -> Transport.send(any(Message.class)))
                    .thenAnswer(invocation -> null);

            assertDoesNotThrow(() ->
                    emailService.sendOrderEmail(
                            "user@test.com",
                            "Test subject",
                            "Test message"
                    )
            );

            transportMock.verify(() -> Transport.send(any(Message.class)), times(1));
        }
    }

    @Test
    void sendOrderEmail_shouldThrowRuntimeException_whenMessagingExceptionOccurs() {
        try (MockedStatic<Transport> transportMock = mockStatic(Transport.class)) {

            transportMock.when(() -> Transport.send(any(Message.class)))
                    .thenThrow(new MessagingException("SMTP error"));

            RuntimeException exception = assertThrows(
                    RuntimeException.class,
                    () -> emailService.sendOrderEmail(
                            "user@test.com",
                            "Test subject",
                            "Test message"
                    )
            );

            assertTrue(exception.getCause() instanceof MessagingException);
        }
    }
}
