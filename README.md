# Job Application Autofill — Browser Extension

A browser extension that automates filling out job application forms across different recruitment sites, built as a Bachelor's thesis project.

**Status:** In development (Aug–Oct 2026)
**Author:** Ilari Koikkalainen

## Problem

Job seekers re-enter the same information — contact details, cover letter, salary expectations, education — into dozens of different application forms. Every site structures its HTML differently (varying `name`, `id`, `placeholder`, `label` attributes), so there's no single selector pattern that works everywhere.

## What it does

- Detects form fields on recruitment sites using multiple heuristics (attributes, labels, context)
- Auto-fills fields it's confident about
- Flags low-confidence or empty/incorrect fields for manual review via a popup notification, instead of guessing and silently submitting wrong data
- Aims to minimize the number of fields the user has to check manually, without sacrificing accuracy

## Tech stack

| Layer | Tech |
|---|---|
| Extension | Chrome Manifest V3, TypeScript, React, Tailwind CSS |
| Backend | Java 21, Spring Boot, Spring Security, Spring Data JPA |
| Database | PostgreSQL |
| Auth | JWT |
| Tooling | Docker, Postman, Git |

## Architecture

**Phase 1 — Prototype (no backend)**
Local-storage-only prototype used to validate field-detection accuracy on real recruitment sites.

**Phase 2 — Backend**
User accounts, JWT auth, profile management, application history, duplicate-application detection.

**Phase 3 — Testing & docs**
Full testing across multiple recruitment sites, documentation, thesis writeup.

## Roadmap

- [ ] **Aug 10 – Aug 31, 2026** — Backend-less prototype, local storage, real-world field-detection validation
- [ ] **Sep 1 – Sep 15, 2026** — Backend: user accounts, JWT auth, profile management, application history, duplicate detection
- [ ] **Sep 15 – Oct 12, 2026** — Full testing, documentation, thesis report

## Why this project

Beyond solving a real annoyance for anyone actively job hunting, this serves as a demonstration of full-stack skills: browser extension development, REST API design, authentication, and database design — and as a portfolio piece for my own transition from student to professional.

## Getting started

```bash
# Clone
git clone <repo-url>
cd <repo-name>

# Extension (frontend)
cd extension
npm install
npm run dev

# Backend
cd backend
docker compose up -d      # starts PostgreSQL
./mvnw spring-boot:run
```

Then load the `extension/dist` folder as an unpacked extension in Chrome (`chrome://extensions` → Developer mode → Load unpacked).

## License

TBD
