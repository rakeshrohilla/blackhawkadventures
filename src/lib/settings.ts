import { prisma } from "./db";
import { SETTING_DEFAULTS, type SettingKey, type Settings } from "./settings-defaults";

export { SETTING_DEFAULTS, SETTING_LABELS, SETTING_MULTILINE } from "./settings-defaults";
export type { SettingKey, Settings } from "./settings-defaults";

export async function getSettings(): Promise<Settings> {
  const settings: Settings = { ...SETTING_DEFAULTS };

  try {
    const rows = await prisma.siteSetting.findMany();
    for (const row of rows) {
      if (row.key in settings) settings[row.key as SettingKey] = row.value;
    }
  } catch {
    // Database unreachable (e.g. a build with no DB available) — use defaults.
  }

  return settings;
}
