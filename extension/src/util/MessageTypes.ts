import type { ProfileFormData } from "../interface/ProfileInterface";

export type Msg =
  | { type: "UNCERTAIN_COUNT"; count: number }
  | { type: "GET_ACTIVE_PROFILE" }
  | { type: "GET_UNCERTAIN" }
  | { type: "FILL_ALL" }
  | { type: "FILL_FIELD"; uid: string; fieldType: string }
  | { type: "HIGHLIGHT_FIELD"; uid: string };

export interface ActiveProfileResponse {
  profile?: ProfileFormData;
  error?: string;
}

export interface FillAllResponse {
  filled: number;
  detected: number;
  error?: string;
}

export const FIELD_TYPES = [
  "firstName",
  "lastName",
  "fullName",
  "email",
  "phone",
  "dateOfBirth",
  "address",
  "location",
  "city",
  "postalCode",
  "country",
  "currentTitle",
  "yearsOfExperience",
  "education",
  "school",
  "graduationYear",
  "reference",
  "linkedin",
  "github",
  "portfolio",
  "summary",
  "coverLetter",
  "salaryExpectation",
  "availability",
  "willingToRelocate",
] as const;

export interface UncertainDTO {
  uid: string;
  guess: string;
  confidence: number;
  label: string;
}
