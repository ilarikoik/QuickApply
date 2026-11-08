package com.example.QuickApply.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.QuickApply.dto.JobApplicationRequest;
import com.example.QuickApply.dto.JobApplicationResponse;
import com.example.QuickApply.exception.NotFoundException;
import com.example.QuickApply.model.ApplicationStatus;
import com.example.QuickApply.model.JobApplication;
import com.example.QuickApply.model.Users;
import com.example.QuickApply.repository.JobApplicationRepository;
import com.example.QuickApply.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> findAll(String username) {
        Users owner = findOwner(username);
        return jobApplicationRepository.findAllByOwnerIdOrderByIdDesc(owner.getId()).stream()
                .map(JobApplicationService::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public JobApplicationResponse findById(String username, Long applicationId) {
        Users owner = findOwner(username);
        return toResponse(findOwnedApplication(applicationId, owner.getId()));
    }

    @Transactional
    public JobApplicationResponse create(String username, JobApplicationRequest request) {
        JobApplication application = new JobApplication();
        application.setOwner(findOwner(username));
        applyRequest(application, request);
        return toResponse(jobApplicationRepository.save(application));
    }

    @Transactional
    public JobApplicationResponse update(String username, Long applicationId, JobApplicationRequest request) {
        Users owner = findOwner(username);
        JobApplication application = findOwnedApplication(applicationId, owner.getId());
        applyRequest(application, request);
        return toResponse(jobApplicationRepository.save(application));
    }

    @Transactional
    public void delete(String username, Long applicationId) {
        Users owner = findOwner(username);
        jobApplicationRepository.delete(findOwnedApplication(applicationId, owner.getId()));
    }

    private Users findOwner(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private JobApplication findOwnedApplication(Long applicationId, Long ownerId) {
        return jobApplicationRepository.findByIdAndOwnerId(applicationId, ownerId)
                .orElseThrow(() -> new NotFoundException("Job application not found"));
    }

    private static void applyRequest(JobApplication application, JobApplicationRequest request) {
        application.setCompanyName(request.companyName());
        application.setJobTitle(request.jobTitle());
        application.setJobUrl(request.jobUrl());
        application.setStatus(request.status() == null ? ApplicationStatus.SAVED : request.status());
        application.setAppliedAt(request.appliedAt());
        application.setNotes(request.notes());
    }

    private static JobApplicationResponse toResponse(JobApplication application) {
        return new JobApplicationResponse(
                application.getId(),
                application.getCompanyName(),
                application.getJobTitle(),
                application.getJobUrl(),
                application.getStatus(),
                application.getAppliedAt(),
                application.getNotes());
    }
}
