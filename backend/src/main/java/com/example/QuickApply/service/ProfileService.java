package com.example.QuickApply.service;

import java.util.List;
import java.util.stream.Stream;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.QuickApply.dto.LocalizedTextDto;
import com.example.QuickApply.dto.ProfileRequest;
import com.example.QuickApply.dto.ProfileResponse;
import com.example.QuickApply.exception.NotFoundException;
import com.example.QuickApply.model.LocalizedText;
import com.example.QuickApply.model.Profile;
import com.example.QuickApply.model.Users;
import com.example.QuickApply.repository.ProfileRepository;
import com.example.QuickApply.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ProfileResponse> findAll(String username) {
        Users owner = findOwner(username);
        return profileRepository.findAllByOwnerIdOrderByIdAsc(owner.getId()).stream()
                .map(ProfileService::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProfileResponse findById(String username, Long profileId) {
        Users owner = findOwner(username);
        return toResponse(findOwnedProfile(profileId, owner.getId()));
    }

    @Transactional
    public ProfileResponse create(String username, ProfileRequest request) {
        Profile profile = new Profile();
        profile.setOwner(findOwner(username));
        applyRequest(profile, request);
        return toResponse(profileRepository.save(profile));
    }

    @Transactional
    public ProfileResponse update(String username, Long profileId, ProfileRequest request) {
        Users owner = findOwner(username);
        Profile profile = findOwnedProfile(profileId, owner.getId());
        applyRequest(profile, request);
        return toResponse(profileRepository.save(profile));
    }

    @Transactional
    public void delete(String username, Long profileId) {
        Users owner = findOwner(username);
        profileRepository.delete(findOwnedProfile(profileId, owner.getId()));
    }

    private Users findOwner(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private Profile findOwnedProfile(Long profileId, Long ownerId) {
        return profileRepository.findByIdAndOwnerId(profileId, ownerId)
                .orElseThrow(() -> new NotFoundException("Profile not found"));
    }

    private static void applyRequest(Profile profile, ProfileRequest request) {
        profile.setProfileName(request.profileName());
        profile.setFirstName(request.firstName());
        profile.setLastName(request.lastName());
        profile.setEmail(request.email());
        profile.setPhone(request.phone());
        profile.setDateOfBirth(request.dateOfBirth());
        profile.setAddress(request.address());
        profile.setCity(request.city());
        profile.setPostalCode(request.postalCode());
        profile.setCountry(request.country());
        profile.setCurrentTitle(toEntity(request.currentTitle()));
        profile.setYearsOfExperience(request.yearsOfExperience());
        profile.setEducation(toEntity(request.education()));
        profile.setSchool(request.school());
        profile.setGraduationYear(request.graduationYear());
        profile.setReference(request.reference());
        profile.setLinkedin(request.linkedin());
        profile.setGithub(request.github());
        profile.setPortfolio(request.portfolio());
        profile.setSummary(toEntity(request.summary()));
        profile.setCoverLetter(toEntity(request.coverLetter()));
        profile.setSalaryExpectation(request.salaryExpectation());
        profile.setAvailability(toEntity(request.availability()));
        profile.setWillingToRelocate(request.willingToRelocate());
    }

    private static ProfileResponse toResponse(Profile profile) {
        String fullName = Stream.of(profile.getFirstName(), profile.getLastName())
                .filter(value -> value != null && !value.isBlank())
                .collect(Collectors.joining(" "));
        return new ProfileResponse(
                profile.getId(),
                profile.getProfileName(),
                profile.getFirstName(),
                profile.getLastName(),
                fullName,
                profile.getEmail(),
                profile.getPhone(),
                profile.getDateOfBirth(),
                profile.getAddress(),
                profile.getCity(),
                profile.getPostalCode(),
                profile.getCountry(),
                toDto(profile.getCurrentTitle()),
                profile.getYearsOfExperience(),
                toDto(profile.getEducation()),
                profile.getSchool(),
                profile.getGraduationYear(),
                profile.getReference(),
                profile.getLinkedin(),
                profile.getGithub(),
                profile.getPortfolio(),
                toDto(profile.getSummary()),
                toDto(profile.getCoverLetter()),
                profile.getSalaryExpectation(),
                toDto(profile.getAvailability()),
                profile.isWillingToRelocate());
    }

    private static LocalizedText toEntity(LocalizedTextDto value) {
        return value == null ? null : new LocalizedText(value.fi(), value.en());
    }

    private static LocalizedTextDto toDto(LocalizedText value) {
        return value == null ? null : new LocalizedTextDto(value.getFi(), value.getEn());
    }
}
