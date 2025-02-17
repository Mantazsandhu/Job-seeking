import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRoleName(role: string) {
  switch (role) {
    case "JOB_SEEKER":
      return "Job Seeker";
    case "EMPLOYER":
      return "Employer";
    default:
      return role;
  }
}
