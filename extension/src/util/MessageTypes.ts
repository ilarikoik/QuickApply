export type Msg =
  | { type: "UNCERTAIN_COUNT"; count: number }
  | { type: "GET_UNCERTAIN" }
  | { type: "FILL_FIELD"; uid: string; fieldType: string }
  | { type: "HIGHLIGHT_FIELD"; uid: string };

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
