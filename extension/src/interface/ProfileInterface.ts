export interface LocalizedText {
  fi: string;
  en: string;
}
type ProfileValue = string | number | boolean | LocalizedText;
export type Profile = Record<string, ProfileValue>;

export interface ProfileFormData {
  id: number;
  profileName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;

  address: string;
  city: string;
  postalCode: string;
  country: string;
  salaryExpectation: string;
  willingToRelocate: boolean;
  yearsOfExperience: string;
  school: string;
  graduationYear: string;
  linkedin: string;
  github: string;
  portfolio: string;
  reference: string;

  currentTitle: LocalizedText;
  education: LocalizedText;
  summary: LocalizedText;
  coverLetter: LocalizedText;
  availability: LocalizedText;
  [key: string]: string | number | boolean | LocalizedText;
}
