package com.example.QuickApply.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.QuickApply.model.JobApplication;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findAllByOwnerIdOrderByIdDesc(Long ownerId);

    Optional<JobApplication> findByIdAndOwnerId(Long id, Long ownerId);
}
