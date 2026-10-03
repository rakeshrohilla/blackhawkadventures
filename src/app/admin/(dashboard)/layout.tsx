import type { Metadata } from "next";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  const [pendingBookings, newEnquiries] = await Promise.all([
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.enquiry.count({ where: { status: "NEW" } }),
  ]);

  return (
    <div className="min-h-screen bg-mist lg:flex">
      <AdminSidebar user={user} counts={{ bookings: pendingBookings, enquiries: newEnquiries }} />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">{children}</div>
      </div>
    </div>
  );
}
