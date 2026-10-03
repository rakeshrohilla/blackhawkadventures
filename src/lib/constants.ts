import type {
  BookingStatus,
  DepartureStatus,
  Difficulty,
  EnquiryStatus,
  PaymentStatus,
} from "@/generated/prisma/client";

export const SITE_NAME = "Black Hawk Adventures";
export const SITE_TAGLINE = "Road trips and mountain escapes, run properly.";

/** Regions we sell. Edit freely — tours store the region as text. */
export const REGIONS = [
  "Himachal",
  "Ladakh",
  "Uttarakhand",
  "Kashmir",
  "North East",
  "Rajasthan",
  "Coastal",
] as const;

export const ART_VARIANTS = ["peaks", "valley", "forest", "coast", "dunes", "canyon"] as const;
export type ArtVariant = (typeof ART_VARIANTS)[number];

export const DIFFICULTIES: Difficulty[] = ["EASY", "MODERATE", "CHALLENGING", "EXPERT"];

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  EASY: "Easy",
  MODERATE: "Moderate",
  CHALLENGING: "Challenging",
  EXPERT: "Expert",
};

export const DIFFICULTY_BLURB: Record<Difficulty, string> = {
  EASY: "Gentle days, comfortable stays, no prior experience needed.",
  MODERATE: "4–6 hours of walking or driving a day on mixed terrain.",
  CHALLENGING: "Long days at altitude or on rough ground. Come fit.",
  EXPERT: "Serious terrain, cold, and exposure. Previous high-altitude experience required.",
};

export const DEPARTURE_STATUS_LABEL: Record<DepartureStatus, string> = {
  SCHEDULED: "Scheduled",
  GUARANTEED: "Guaranteed",
  FULL: "Full",
  CANCELLED: "Cancelled",
};

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  UNPAID: "Unpaid",
  DEPOSIT_PAID: "Deposit paid",
  PAID: "Paid in full",
  REFUNDED: "Refunded",
};

export const ENQUIRY_STATUS_LABEL: Record<EnquiryStatus, string> = {
  NEW: "New",
  IN_PROGRESS: "In progress",
  CLOSED: "Closed",
};

/** Percentage of the trip cost taken to hold a seat. */
export const DEPOSIT_PERCENT = 25;

export const MAX_GUESTS_PER_BOOKING = 10;
