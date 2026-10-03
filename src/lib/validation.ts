import { z } from "zod";

import { ART_VARIANTS, MAX_GUESTS_PER_BOOKING, REGIONS } from "./constants";

/** Checkboxes arrive as "on" (or are absent) from FormData. */
const checkbox = z.preprocess(
  (value) => value === "on" || value === "true" || value === true,
  z.boolean(),
);

/** Admin types whole rupees; we store integer minor units. */
const majorUnitsToMinor = z.coerce
  .number({ error: "Enter a valid amount" })
  .min(0, "Amount cannot be negative")
  .max(100_000_000, "That amount looks wrong")
  .transform((value) => Math.round(value * 100));

/** Textarea with one item per line -> string[] */
const linesToArray = z
  .string()
  .default("")
  .transform((value) =>
    value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  );

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value === "" ? undefined : value));

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || /^https?:\/\/\S+$/i.test(value), {
    message: "Enter a full URL starting with http:// or https://",
  })
  .transform((value) => (value === "" ? undefined : value));

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
  next: z.string().optional(),
});

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(120),
  email: z.email("Enter a valid email address"),
  phone: optionalText(32),
  tourId: optionalText(40),
  subject: optionalText(160),
  message: z
    .string()
    .trim()
    .min(10, "Give us a little more detail (at least 10 characters)")
    .max(4000, "Please keep it under 4000 characters"),
});

export const travellerSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the traveller's full name").max(120),
  age: z.coerce.number().int().min(1).max(100).optional(),
  dietary: optionalText(200),
  emergencyContact: optionalText(200),
});

export const bookingSchema = z.object({
  departureId: z.string().min(1, "Choose a departure"),
  guests: z.coerce
    .number({ error: "Choose how many people are travelling" })
    .int()
    .min(1, "At least one traveller")
    .max(MAX_GUESTS_PER_BOOKING, `Up to ${MAX_GUESTS_PER_BOOKING} per booking — contact us for larger groups`),
  customerName: z.string().trim().min(2, "Enter your full name").max(120),
  customerEmail: z.email("Enter a valid email address"),
  customerPhone: z.string().trim().min(6, "Enter a phone number we can reach you on").max(32),
  customerCountry: optionalText(80),
  notes: optionalText(2000),
});

export const tourSchema = z.object({
  title: z.string().trim().min(3, "Give the trip a title").max(140),
  slug: optionalText(90),
  tagline: z.string().trim().min(3, "Add a short tagline").max(180),
  summary: z.string().trim().min(20, "Write a short card summary").max(400),
  description: z.string().trim().min(40, "Describe the trip properly").max(8000),
  region: z.enum(REGIONS, { error: "Pick a region" }),
  difficulty: z.enum(["EASY", "MODERATE", "CHALLENGING", "EXPERT"]),
  durationDays: z.coerce.number().int().min(1, "At least one day").max(90),
  groupSizeMax: z.coerce.number().int().min(1).max(60),
  minAge: z.coerce.number().int().min(0).max(99).optional(),
  basePrice: majorUnitsToMinor,
  currency: z.string().trim().length(3).default("INR"),
  heroImageUrl: optionalUrl,
  artVariant: z.enum(ART_VARIANTS),
  highlights: linesToArray,
  inclusions: linesToArray,
  exclusions: linesToArray,
  gallery: linesToArray,
  featured: checkbox,
  published: checkbox,
});

export const itineraryDaySchema = z.object({
  tourId: z.string().min(1),
  dayNumber: z.coerce.number().int().min(1).max(90),
  title: z.string().trim().min(2, "Give the day a title").max(160),
  body: z.string().trim().min(10, "Describe the day").max(3000),
  distanceKm: z.coerce.number().min(0).max(2000).optional(),
  altitudeM: z.coerce.number().int().min(-500).max(9000).optional(),
  stay: optionalText(160),
});

export const departureSchema = z
  .object({
    tourId: z.string().min(1),
    startDate: z.coerce.date({ error: "Pick a start date" }),
    endDate: z.coerce.date({ error: "Pick an end date" }),
    capacity: z.coerce.number().int().min(1, "Capacity must be at least 1").max(60),
    price: majorUnitsToMinor.optional(),
    status: z.enum(["SCHEDULED", "GUARANTEED", "FULL", "CANCELLED"]),
    notes: optionalText(500),
  })
  .refine((value) => value.endDate >= value.startDate, {
    message: "The end date cannot be before the start date",
    path: ["endDate"],
  });

export const reviewSchema = z.object({
  tourId: optionalText(40),
  authorName: z.string().trim().min(2, "Enter the reviewer's name").max(120),
  authorLocation: optionalText(120),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(10, "Add the review text").max(2000),
  published: checkbox,
});

export const userSchema = z.object({
  name: z.string().trim().min(2, "Enter a name").max(120),
  email: z.email("Enter a valid email address"),
  password: z.string().min(10, "Use at least 10 characters").max(200),
  role: z.enum(["ADMIN", "EDITOR"]),
});

export type FormErrors = Record<string, string>;

/** Flatten Zod issues into { fieldName: firstMessage } for inline display. */
export function fieldErrors(error: z.ZodError): FormErrors {
  const errors: FormErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "_form";
    errors[key] ??= issue.message;
  }
  return errors;
}

export type ActionState = {
  ok: boolean;
  message?: string;
  errors?: FormErrors;
};

export const IDLE_STATE: ActionState = { ok: false };
