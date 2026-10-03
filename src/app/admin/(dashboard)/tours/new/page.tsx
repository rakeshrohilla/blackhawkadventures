import { PageHeader } from "@/components/admin/Ui";
import { TourForm } from "@/components/admin/TourForm";

export default function NewTourPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="New trip"
        subtitle="Create the trip first, then add its itinerary and departure dates."
      />
      <TourForm />
    </div>
  );
}
