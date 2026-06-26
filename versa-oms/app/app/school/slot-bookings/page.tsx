import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Slot Bookings"
      eyebrow="school \u00b7 school_bookings"
      endpoint="/api/school/slot-bookings"
      columns={[{"key": "booking_code", "label": "Booking"}, {"key": "payment_status_at_booking", "label": "Payment Status At Booking"}, {"key": "booked_at", "label": "Booked At"}, {"key": "cancelled_at", "label": "Cancelled At"}, {"key": "status", "label": "Status"}]}
      statusKey="status"
      moduleId="school_bookings"
      createFields={[{"key": "participation_id", "label": "Participation", "type": "text"}, {"key": "exam_slot_id", "label": "Exam slot", "type": "text"}, {"key": "confirmed_student_count", "label": "Students", "type": "number"}, {"key": "payment_status_at_booking", "label": "Payment status", "type": "text"}]}
      actions={[{"action": "cancel", "label": "Cancel booking", "variant": "light"}]}
    />
  );
}
