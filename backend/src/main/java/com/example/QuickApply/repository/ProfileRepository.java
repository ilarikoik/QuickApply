package com.example.QuickApply.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.QuickApply.model.Profile;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
    List<Profile> findAllByOwnerIdOrderByIdAsc(Long ownerId);

    Optional<Profile> findByIdAndOwnerId(Long id, Long ownerId);
}
