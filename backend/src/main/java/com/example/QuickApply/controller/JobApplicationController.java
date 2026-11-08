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

import com.example.QuickApply.dto.JobApplicationRequest;
import com.example.QuickApply.dto.JobApplicationResponse;
import com.example.QuickApply.service.JobApplicationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    @GetMapping
    public List<JobApplicationResponse> findAll(@AuthenticationPrincipal UserDetails userDetails) {
        return jobApplicationService.findAll(userDetails.getUsername());
    }

    @GetMapping("/{applicationId}")
    public JobApplicationResponse findById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long applicationId) {
        return jobApplicationService.findById(userDetails.getUsername(), applicationId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JobApplicationResponse create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody JobApplicationRequest request) {
        return jobApplicationService.create(userDetails.getUsername(), request);
    }

    @PutMapping("/{applicationId}")
    public JobApplicationResponse update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long applicationId,
            @Valid @RequestBody JobApplicationRequest request) {
        return jobApplicationService.update(userDetails.getUsername(), applicationId, request);
    }

    @DeleteMapping("/{applicationId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long applicationId) {
        jobApplicationService.delete(userDetails.getUsername(), applicationId);
    }
}
