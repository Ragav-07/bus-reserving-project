package com.busreserve.controller;

import com.busreserve.dto.AuthResponse;
import com.busreserve.dto.LoginRequest;
import com.busreserve.dto.RegisterRequest;
import com.busreserve.model.User;
import com.busreserve.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AuthResponse(false, "Email is already registered", null));
        }

        User newUser = new User(request.getName(), request.getEmail(), request.getPhone(), request.getPassword());
        userRepository.save(newUser);

        // Don't send password back
        newUser.setPassword(null);

        return ResponseEntity.ok(new AuthResponse(true, "Registration successful", newUser));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // In a real application, use password encoding like BCrypt
            if (user.getPassword().equals(request.getPassword())) {
                user.setPassword(null);
                return ResponseEntity.ok(new AuthResponse(true, "Login successful", user));
            }
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new AuthResponse(false, "Invalid email or password", null));
    }
}
