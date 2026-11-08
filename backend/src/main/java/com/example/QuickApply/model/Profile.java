package com.example.QuickApply.model;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String profileName;

    @Column(length = 100)
    private String firstName;

    @Column(length = 100)
    private String lastName;

    @Column(length = 320)
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(length = 30)
    private String dateOfBirth;

    @Column(length = 255)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 30)
    private String postalCode;

    @Column(length = 100)
    private String country;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "fi", column = @Column(name = "current_title_fi", length = 255)),
            @AttributeOverride(name = "en", column = @Column(name = "current_title_en", length = 255))
    })
    private LocalizedText currentTitle;

    @Column(length = 30)
    private String yearsOfExperience;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "fi", column = @Column(name = "education_fi", length = 255)),
            @AttributeOverride(name = "en", column = @Column(name = "education_en", length = 255))
    })
    private LocalizedText education;

    @Column(length = 255)
    private String school;

    @Column(length = 10)
    private String graduationYear;

    @Column(length = 255)
    private String reference;

    @Column(length = 500)
    private String linkedin;

    @Column(length = 500)
    private String github;

    @Column(length = 500)
    private String portfolio;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "fi", column = @Column(name = "summary_fi", length = 4000)),
            @AttributeOverride(name = "en", column = @Column(name = "summary_en", length = 4000))
    })
    private LocalizedText summary;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "fi", column = @Column(name = "cover_letter_fi", length = 10000)),
            @AttributeOverride(name = "en", column = @Column(name = "cover_letter_en", length = 10000))
    })
    private LocalizedText coverLetter;

    @Column(length = 50)
    private String salaryExpectation;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "fi", column = @Column(name = "availability_fi", length = 255)),
            @AttributeOverride(name = "en", column = @Column(name = "availability_en", length = 255))
    })
    private LocalizedText availability;

    @Column(nullable = false)
    private boolean willingToRelocate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private Users owner;
}
