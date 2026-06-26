import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title="Slot Bookings"
      eyebrow="staff \u00b7 exam_slots_bookings"
      endpoint="/api/staff/exams/slot-bookings"
      columns={[{"key": "booking_code", "label": "Booking"}, {"key": "payment_status_at_booking", "label": "Payment Status At Booking"}, {"key": "booked_at", "label": "Booked At"}, {"key": "cancelled_at", "label": "Cancelled At"}, {"key": "status", "label": "Status"}]}
      description="Manage and review slot bookings across the olympiad operations."
      breadcrumbs={[{"label": "Staff", "href": "/staff/dashboard"}, {"label": "Exams", "href": "/staff/exams"}, {"label": "Slot Bookings"}]}
      nextAction="\u2192 Use \u201cNew Slot Booking\u201d to add one, then act on it from the list."
      statusKey="status"
      moduleId="exam_slots_bookings"
      createFields={[{"key": "school_id", "label": "School", "type": "reference", "refTable": "schools"}, {"key": "participation_id", "label": "Participation", "type": "reference", "refTable": "participations"}, {"key": "exam_slot_id", "label": "Exam Slot", "type": "reference", "refTable": "exam_slots"}, {"key": "payment_status_at_booking", "label": "Payment Status At Booking", "type": "text"}, {"key": "booked_at", "label": "Booked At", "type": "date"}, {"key": "cancelled_at", "label": "Cancelled At", "type": "date"}, {"key": "cancellation_reason", "label": "Cancellation Reason", "type": "text"}]}
      actions={[{"action": "cancel", "label": "Cancel", "variant": "light", "reason": true, "danger": true}, {"action": "lock", "label": "Lock", "variant": "blue"}]}
      toolbar={{"facet": {"key": "status", "options": [{"value": "reserved", "label": "Reserved"}, {"value": "confirmed", "label": "Confirmed"}, {"value": "cancelled", "label": "Cancelled"}, {"value": "rescheduled", "label": "Rescheduled"}, {"value": "locked", "label": "Locked"}]}, "search": true, "sort": [{"value": "created_at:desc", "label": "Newest"}]}}
    />
  );
}
