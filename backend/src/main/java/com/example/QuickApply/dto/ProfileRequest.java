package com.example.QuickApply.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@JsonIgnoreProperties({ "id", "fullName" })
public record ProfileRequest(
        @NotBlank @Size(max = 100) String profileName,
        @Size(max = 100) String firstName,
        @Size(max = 100) String lastName,
        @Email @Size(max = 320) String email,
        @Size(max = 50) String phone,
        @Size(max = 30) String dateOfBirth,
        @Size(max = 255) String address,
        @Size(max = 100) String city,
        @Size(max = 30) String postalCode,
        @Size(max = 100) String country,
        LocalizedTextDto currentTitle,
        @Size(max = 30) String yearsOfExperience,
        LocalizedTextDto education,
        @Size(max = 255) String school,
        @Size(max = 10) String graduationYear,
        @Size(max = 255) String reference,
        @Size(max = 500) String linkedin,
        @Size(max = 500) String github,
        @Size(max = 500) String portfolio,
        LocalizedTextDto summary,
        LocalizedTextDto coverLetter,
        @Size(max = 50) String salaryExpectation,
        LocalizedTextDto availability,
        boolean willingToRelocate) {
}
