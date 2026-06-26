import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Slot Bookings"
      eyebrow="school \u00b7 school_bookings"
      endpoint="/api/school/slot-bookings"
      columns={[{"key": "booking_code", "label": "Booking"}, {"key": "payment_status_at_booking", "label": "Payment Status At Booking"}, {"key": "booked_at", "label": "Booked At"}, {"key": "cancelled_at", "label": "Cancelled At"}, {"key": "status", "label": "Status"}]}
      description="Manage and review slot bookings across the olympiad operations."
      breadcrumbs={[{"label": "School", "href": "/school/dashboard"}, {"label": "Slot Bookings"}]}
      nextAction="\u2192 Use \u201cNew Slot Booking\u201d to add one, then act on it from the list."
      statusKey="status"
      moduleId="school_bookings"
      createFields={[{"key": "participation_id", "label": "Participation", "type": "reference", "refTable": "participations"}, {"key": "exam_slot_id", "label": "Exam Slot", "type": "reference", "refTable": "exam_slots"}, {"key": "payment_status_at_booking", "label": "Payment Status At Booking", "type": "text"}, {"key": "booked_at", "label": "Booked At", "type": "date"}, {"key": "cancelled_at", "label": "Cancelled At", "type": "date"}, {"key": "cancellation_reason", "label": "Cancellation Reason", "type": "text"}]}
      actions={[{"action": "cancel", "label": "Cancel booking", "variant": "light"}]}
    />
  );
}
