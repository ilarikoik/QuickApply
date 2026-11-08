package com.example.QuickApply.dto;

import java.time.LocalDate;

import com.example.QuickApply.model.ApplicationStatus;

public record JobApplicationResponse(
        Long id,
        String companyName,
        String jobTitle,
        String jobUrl,
        ApplicationStatus status,
        LocalDate appliedAt,
        String notes) {
}
