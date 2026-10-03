/** Editable in the admin panel under Settings. Kept free of any imports so the
 *  seed script and the browser bundle can both read it. */
export const SETTING_DEFAULTS = {
  contactEmail: "hello@blackhawkadventures.com",
  contactPhone: "+91 98765 43210",
  whatsappNumber: "919876543210",
  officeAddress: "Black Hawk Adventures, Old Manali Road, Manali, Himachal Pradesh 175131",
  instagramUrl: "https://www.instagram.com/blackhawkadventures/",
  heroHeadline: "Go where the road runs out.",
  heroSubline:
    "Small-group road trips and mountain escapes across the Indian Himalaya — run by people who actually live there.",
  announcement: "Winter 2026 departures are open — Spiti, Chadar and Kedarkantha.",
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;
export type Settings = Record<SettingKey, string>;

export const SETTING_LABELS: Record<SettingKey, string> = {
  contactEmail: "Contact email",
  contactPhone: "Contact phone",
  whatsappNumber: "WhatsApp number (digits only, with country code)",
  officeAddress: "Office address",
  instagramUrl: "Instagram URL",
  heroHeadline: "Homepage headline",
  heroSubline: "Homepage sub-headline",
  announcement: "Announcement bar text (leave blank to hide)",
};

export const SETTING_MULTILINE: SettingKey[] = ["heroSubline", "officeAddress"];
