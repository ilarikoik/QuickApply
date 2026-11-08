package com.example.QuickApply.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.QuickApply.dto.AuthResponse;
import com.example.QuickApply.dto.LoginRequest;
import com.example.QuickApply.dto.RegisterRequest;
import com.example.QuickApply.dto.UserResponse;
import com.example.QuickApply.exception.ConflictException;
import com.example.QuickApply.exception.NotFoundException;
import com.example.QuickApply.model.Role;
import com.example.QuickApply.model.Users;
import com.example.QuickApply.repository.UserRepository;
import com.example.QuickApply.security.AppUserDetailsService;
import com.example.QuickApply.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final AppUserDetailsService userDetailsService;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Username is already in use");
        }

        Users user = new Users();
        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);
        user = userRepository.save(user);
        return createAuthResponse(user, userDetailsService.loadUserByUsername(user.getUsername()));
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        Users user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new NotFoundException("User not found"));
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        return createAuthResponse(user, userDetails);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String username) {
        Users user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        return new UserResponse(user.getId(), user.getUsername());
    }

    private AuthResponse createAuthResponse(Users user, UserDetails userDetails) {
        return new AuthResponse(jwtService.generateToken(userDetails), "Bearer", user.getId(), user.getUsername());
    }
}
