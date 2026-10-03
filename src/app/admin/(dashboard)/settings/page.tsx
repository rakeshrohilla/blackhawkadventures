import { SettingsForm } from "@/components/admin/SettingsForm";
import { PageHeader } from "@/components/admin/Ui";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatDateTime } from "@/lib/format";

export default async function AdminSettingsPage() {
  const [settings, user, staff] = await Promise.all([
    getSettings(),
    getSessionUser(),
    prisma.user.findMany({ orderBy: { createdAt: "asc" }, select: {
      id: true, name: true, email: true, role: true, lastLoginAt: true,
    } }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        subtitle="Contact details and homepage copy. Changes go live immediately."
      />

      <SettingsForm settings={settings} />

      <section className="card p-6">
        <h2 className="display-3 text-lg">Staff accounts</h2>
        <p className="mt-1.5 text-sm text-ink-400">
          Editors can manage trips, bookings and enquiries. Administrators can also delete things.
        </p>
        <ul className="mt-5 divide-y divide-ink/8">
          {staff.map((member) => (
            <li key={member.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
              <div>
                <p className="text-sm font-semibold">
                  {member.name}
                  {member.id === user?.id ? (
                    <span className="ml-2 text-[0.7rem] font-bold uppercase text-ember">You</span>
                  ) : null}
                </p>
                <p className="text-xs text-ink-400">{member.email}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-xs text-ink-400">
                  {member.lastLoginAt ? `Last in ${formatDateTime(member.lastLoginAt)}` : "Never signed in"}
                </p>
                <span
                  className={`pill ${
                    member.role === "ADMIN" ? "bg-ink text-mist" : "bg-mist-200 text-ink-600"
                  }`}
                >
                  {member.role}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-5 rounded-xl bg-mist px-4 py-3 text-xs leading-relaxed text-ink-400">
          Staff accounts are managed from the command line for now — see{" "}
          <code className="font-mono">npm run staff:add</code> in the README. Passwords are stored
          as bcrypt hashes and never logged.
        </p>
      </section>
    </div>
  );
}
