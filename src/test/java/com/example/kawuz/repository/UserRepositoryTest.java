package com.example.kawuz.repository;

import com.example.kawuz.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        User user = new User(
                "user1",
                "hashedPassword123",
                "user1@test.com"
        );

        User admin = new User(
                "admin",
                "adminPassword",
                "admin@test.com",
                true
        );

        userRepository.save(user);
        userRepository.save(admin);
    }

    @Test
    void shouldSaveUsersCorrectly() {
        var users = userRepository.findAll();

        assertThat(users).hasSize(2);
        assertThat(users).allMatch(u -> u.getId() != null);
    }

    @Test
    void shouldFindUserByUsername() {
        Optional<User> result = userRepository.findByUsername("user1");

        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo("user1@test.com");
        assertThat(result.get().isAdmin()).isFalse();
    }

    @Test
    void shouldReturnEmptyOptionalWhenUsernameNotFound() {
        Optional<User> result = userRepository.findByUsername("unknown");

        assertThat(result).isEmpty();
    }

    @Test
    void shouldBeCaseSensitiveByDefault() {
        Optional<User> result = userRepository.findByUsername("USER1");

        assertThat(result).isEmpty();
    }

    @Test
    void shouldAllowMultipleUsersWithDifferentUsernames() {
        User anotherUser = new User(
                "user2",
                "pass",
                "user2@test.com"
        );

        userRepository.save(anotherUser);

        assertThat(userRepository.findAll()).hasSize(3);
    }
}
