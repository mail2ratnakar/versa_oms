import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Slot Bookings"
      eyebrow="school \u00b7 school_bookings"
      endpoint="/api/school/slot-bookings"
      columns={[{"key": "booking_code", "label": "booking code"}, {"key": "payment_status_at_booking", "label": "payment status at booking"}, {"key": "booked_at", "label": "booked at"}, {"key": "cancelled_at", "label": "cancelled at"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="school_bookings"
      createFields={[{ key: "participation_id", label: "Participation" }, { key: "exam_slot_id", label: "Exam slot" }, { key: "confirmed_student_count", label: "Students", type: "number" }, { key: "payment_status_at_booking", label: "Payment status" }]}
      actions={[{"action": "cancel", "label": "Cancel booking", "variant": "light"}]}
    />
  );
}
