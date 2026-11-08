package com.example.QuickApply.dto;

import java.time.LocalDate;

import com.example.QuickApply.model.ApplicationStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record JobApplicationRequest(
        @NotBlank @Size(max = 255) String companyName,
        @NotBlank @Size(max = 255) String jobTitle,
        @Size(max = 1000) String jobUrl,
        ApplicationStatus status,
        LocalDate appliedAt,
        @Size(max = 5000) String notes) {
}
