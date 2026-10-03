"use client";

import { useActionState } from "react";

import { saveSettingsAction } from "@/actions/admin";
import { FormBanner, SubmitButton } from "@/components/site/FormBits";
import {
  SETTING_LABELS,
  SETTING_MULTILINE,
  type SettingKey,
  type Settings,
} from "@/lib/settings-defaults";
import { IDLE_STATE } from "@/lib/validation";

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action] = useActionState(saveSettingsAction, IDLE_STATE);
  const keys = Object.keys(SETTING_LABELS) as SettingKey[];

  return (
    <form action={action} className="space-y-6">
      <FormBanner ok={state.ok} message={state.message} />

      <div className="card space-y-5 p-6">
        {keys.map((key) => (
          <div key={key}>
            <label className="label" htmlFor={key}>
              {SETTING_LABELS[key]}
            </label>
            {SETTING_MULTILINE.includes(key) ? (
              <textarea id={key} name={key} className="textarea min-h-24" defaultValue={settings[key]} />
            ) : (
              <input id={key} name={key} className="input" defaultValue={settings[key]} />
            )}
          </div>
        ))}
      </div>

      <SubmitButton className="btn btn-primary" pendingLabel="Saving…">
        Save settings
      </SubmitButton>
    </form>
  );
}
