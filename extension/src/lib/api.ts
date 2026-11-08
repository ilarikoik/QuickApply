import type { LocalizedText, ProfileFormData } from "../interface/ProfileInterface";

const API_BASE_URL = "http://localhost:8080";

interface ApiError {
  message?: string;
  errors?: Record<string, string>;
}

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  username: string;
}

export interface ProfileResponse {
  id: number;
  profileName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  currentTitle: LocalizedText | null;
  yearsOfExperience: string | null;
  education: LocalizedText | null;
  school: string | null;
  graduationYear: string | null;
  reference: string | null;
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
  summary: LocalizedText | null;
  coverLetter: LocalizedText | null;
  salaryExpectation: string | null;
  availability: LocalizedText | null;
  willingToRelocate: boolean;
}

async function request<T>(
  path: string,
  options: {
    method?: string;
    token?: string;
    body?: unknown;
  } = {},
): Promise<T> {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    ...(options.body === undefined
      ? {}
      : { body: JSON.stringify(options.body) }),
  });
  const payload: unknown =
    response.status === 204 ? undefined : await response.json();

  if (!response.ok) {
    const error = payload as ApiError | undefined;
    const validationErrors = error?.errors
      ? Object.values(error.errors).join(" ")
      : "";
    throw new ApiRequestError(
      [error?.message, validationErrors].filter(Boolean).join(": ") ||
        `Backend request failed (${response.status})`,
      response.status,
    );
  }

  return payload as T;
}

export function login(username: string, password: string) {
  return request<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: { username, password },
  });
}

export function register(username: string, password: string) {
  return request<AuthResponse>("/api/v1/auth/register", {
    method: "POST",
    body: { username, password },
  });
}

export function getProfiles(token: string) {
  return request<ProfileResponse[]>("/api/v1/profiles", { token });
}

export function saveProfile(token: string, profile: ProfileFormData) {
  const { id, ...body } = profile;
  return request<ProfileResponse>(
    id > 0 ? `/api/v1/profiles/${id}` : "/api/v1/profiles",
    {
      method: id > 0 ? "PUT" : "POST",
      token,
      body,
    },
  );
}

export function toProfileFormData(profile: ProfileResponse): ProfileFormData {
  const text = (value: string | null) => value ?? "";
  const localized = (value: LocalizedText | null): LocalizedText => ({
    fi: value?.fi ?? "",
    en: value?.en ?? "",
  });

  return {
    id: profile.id,
    profileName: text(profile.profileName),
    firstName: text(profile.firstName),
    lastName: text(profile.lastName),
    email: text(profile.email),
    phone: text(profile.phone),
    dateOfBirth: text(profile.dateOfBirth),
    address: text(profile.address),
    city: text(profile.city),
    postalCode: text(profile.postalCode),
    country: text(profile.country),
    currentTitle: localized(profile.currentTitle),
    yearsOfExperience: text(profile.yearsOfExperience),
    education: localized(profile.education),
    school: text(profile.school),
    graduationYear: text(profile.graduationYear),
    reference: text(profile.reference),
    linkedin: text(profile.linkedin),
    github: text(profile.github),
    portfolio: text(profile.portfolio),
    summary: localized(profile.summary),
    coverLetter: localized(profile.coverLetter),
    salaryExpectation: text(profile.salaryExpectation),
    availability: localized(profile.availability),
    willingToRelocate: profile.willingToRelocate,
  };
}
