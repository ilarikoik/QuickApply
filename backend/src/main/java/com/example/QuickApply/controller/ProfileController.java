package com.example.QuickApply.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.QuickApply.dto.ProfileRequest;
import com.example.QuickApply.dto.ProfileResponse;
import com.example.QuickApply.service.ProfileService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public List<ProfileResponse> findAll(@AuthenticationPrincipal UserDetails userDetails) {
        return profileService.findAll(userDetails.getUsername());
    }

    @GetMapping("/{profileId}")
    public ProfileResponse findById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long profileId) {
        return profileService.findById(userDetails.getUsername(), profileId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProfileResponse create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ProfileRequest request) {
        return profileService.create(userDetails.getUsername(), request);
    }

    @PutMapping("/{profileId}")
    public ProfileResponse update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long profileId,
            @Valid @RequestBody ProfileRequest request) {
        return profileService.update(userDetails.getUsername(), profileId, request);
    }

    @DeleteMapping("/{profileId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long profileId) {
        profileService.delete(userDetails.getUsername(), profileId);
    }
}
