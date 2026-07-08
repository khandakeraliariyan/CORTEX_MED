import { z } from "zod";

export const trackCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Enter your appointment code")
    .transform((value) => value.toUpperCase()),
});

export type TrackCodeFormValues = z.infer<typeof trackCodeSchema>;
