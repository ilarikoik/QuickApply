package com.example.QuickApply.dto;

public record AuthResponse(String token, String tokenType, Long userId, String username) {
}
