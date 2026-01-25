package com.example.kawuz.controller;

import com.example.kawuz.entity.User;
import com.example.kawuz.repository.UserRepository;
import com.example.kawuz.security.JwtUtil;
import com.example.kawuz.service.CaptchaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)

@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private CaptchaService captchaService;

    @Autowired
    private ObjectMapper objectMapper;


    // ---------- LOGIN ----------

    @Test
    void login_shouldReturn200AndCookie_whenCredentialsCorrect() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("user");
        request.setPassword("pass");
        request.setRecaptchaToken("valid");

        User user = new User();
        user.setUsername("user");
        user.setPassword("pass");
        user.setAdmin(false);

        when(captchaService.verifyCaptcha("valid")).thenReturn(true);
        when(userRepository.findByUsername("user")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken("user")).thenReturn("jwt-token");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(header().exists(HttpHeaders.SET_COOKIE))
                .andExpect(jsonPath("$.username").value("user"))
                .andExpect(jsonPath("$.isAdmin").value(false));
    }

    @Test
    void login_shouldReturn400_whenCaptchaFails() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("user");
        request.setPassword("pass");
        request.setRecaptchaToken("invalid");

        when(captchaService.verifyCaptcha("invalid")).thenReturn(false);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_shouldReturn401_whenPasswordIncorrect() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("user");
        request.setPassword("wrong");
        request.setRecaptchaToken("valid");

        User user = new User();
        user.setUsername("user");
        user.setPassword("correct");

        when(captchaService.verifyCaptcha("valid")).thenReturn(true);
        when(userRepository.findByUsername("user")).thenReturn(Optional.of(user));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    // ---------- LOGOUT ----------

    @Test
    void logout_shouldClearCookie() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(header().exists(HttpHeaders.SET_COOKIE));
    }

    // ---------- ME ----------

    @Test
    void me_shouldReturnUser_whenTokenValid() throws Exception {
        User user = new User();
        user.setUsername("user");
        user.setAdmin(true);

        when(jwtUtil.validateToken("token")).thenReturn(true);
        when(jwtUtil.getUsernameFromToken("token")).thenReturn("user");
        when(userRepository.findByUsername("user")).thenReturn(Optional.of(user));

        mockMvc.perform(get("/api/auth/me")
                        .cookie(new jakarta.servlet.http.Cookie("auth_token", "token")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("user"))
                .andExpect(jsonPath("$.isAdmin").value(true));
    }

    @Test
    void me_shouldReturn401_whenTokenInvalid() throws Exception {
        when(jwtUtil.validateToken("bad")).thenReturn(false);

        mockMvc.perform(get("/api/auth/me")
                        .cookie(new jakarta.servlet.http.Cookie("auth_token", "bad")))
                .andExpect(status().isUnauthorized());
    }

    // ---------- REGISTER ----------

    @Test
    void register_shouldCreateUser_whenDataValid() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setPassword("pass");
        request.setEmail("mail@test.com");
        request.setRecaptchaToken("valid");

        when(captchaService.verifyCaptcha("valid")).thenReturn(true);
        when(userRepository.findByUsername("newuser")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_shouldFail_whenUsernameExists() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("user");
        request.setRecaptchaToken("valid");

        when(captchaService.verifyCaptcha("valid")).thenReturn(true);
        when(userRepository.findByUsername("user")).thenReturn(Optional.of(new User()));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_shouldFail_whenCaptchaInvalid() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setRecaptchaToken("bad");

        when(captchaService.verifyCaptcha("bad")).thenReturn(false);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
