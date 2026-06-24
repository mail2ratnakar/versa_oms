import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Slot Bookings"
      eyebrow="staff \u00b7 exam_slots_bookings"
      endpoint="/api/staff/exams/slot-bookings"
      columns={[{"key": "booking_code", "label": "booking code"}, {"key": "payment_status_at_booking", "label": "payment status at booking"}, {"key": "booked_at", "label": "booked at"}, {"key": "cancelled_at", "label": "cancelled at"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="exam_slots_bookings"
      createFields={[{ key: "payment_status_at_booking", label: "Payment status at booking" }, { key: "booked_at", label: "Booked at" }]}
      actions={[{"action": "cancel", "label": "Cancel", "variant": "light"}, {"action": "lock", "label": "Lock", "variant": "blue"}]}
    />
  );
}
