export interface User {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  token?: string;
  birthDate?: string;
  address?: string;
  phone?: string;
  affiliation?: string;
  licenseGrade?: string;
}

export interface LoginCredentials {
  id?: string;
  email?: string;
  password?: string;
}

export interface SignupCredentials {
  id?: string;
  email?: string;
  password?: string;
  name?: string;
  birthDate?: string;
  address?: string;
  phone?: string;
  affiliation?: string;
  licenseGrade?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  birthDate?: string;
  address?: string;
  phone?: string;
  affiliation?: string;
  licenseGrade?: string;
}
