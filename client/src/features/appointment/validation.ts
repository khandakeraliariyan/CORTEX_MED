import { z } from "zod";

export const bookPatientSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  age: z
    .number({ error: "Age is required" })
    .int("Age must be a whole number")
    .min(0, "Age can't be negative")
    .max(120, "Enter a valid age"),
  gender: z.enum(["male", "female", "other"], {
    error: "Select a gender",
  }),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number"),
  doctor: z
    .string()
    .min(1, "Doctor ID is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Enter a valid 24-character doctor ID"),
  symptoms: z.string().min(1, "Describe the patient's symptoms"),
});

export type BookPatientFormValues = z.infer<typeof bookPatientSchema>;
