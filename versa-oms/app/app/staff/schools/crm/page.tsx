// GENERATED from spec/screens/school_crm.screen.json by _validation/gen_screens.py — DO NOT EDIT.
// To change this page, edit the screen spec and re-run: python _validation/gen_screens.py
import { ModuleTable } from "@/components/ModuleTable";

export default function Page() {
  return (
    <ModuleTable
      title={"School CRM"}
      eyebrow={"staff · school_crm"}
      endpoint={"/api/staff/schools/crm"}
      moduleId={"school_crm"}
      columns={[{"key": "lead_code", "label": "Lead code"}, {"key": "school_name", "label": "School"}, {"key": "city", "label": "City"}, {"key": "stage", "label": "Stage"}, {"key": "lead_status", "label": "Status"}]}
      statusKey={"lead_status"}
      createFields={[{"key": "school_name", "label": "School name", "required": true}, {"key": "city", "label": "City", "required": true}, {"key": "state", "label": "State", "type": "select", "required": true, "options": ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry", "Other"]}, {"key": "country", "label": "Country", "type": "select", "required": true, "default": "India", "options": ["India", "United Arab Emirates", "Saudi Arabia", "Qatar", "Oman", "Kuwait", "Bahrain", "Singapore", "Nepal", "Bhutan", "Sri Lanka", "Other"]}, {"key": "lead_source", "label": "Lead source", "type": "select", "required": true, "options": ["manual", "csv_import", "xlsx_import", "website", "referral", "event", "social", "email_campaign", "partner", "other"]}, {"key": "board", "label": "Board", "type": "select", "options": ["CBSE", "ICSE", "State Board", "Cambridge", "IB", "Other"]}, {"key": "coordinator_name", "label": "Coordinator name"}, {"key": "email", "label": "Email", "type": "email"}, {"key": "phone", "label": "Phone", "type": "tel"}, {"key": "expected_student_count", "label": "Expected students", "type": "number"}]}
      rowSelect={{"key": "stage", "subPath": "stage", "lockStatuses": ["converted", "lost"], "options": ["new_lead", "contacted", "brochure_sent", "demo_scheduled", "demo_completed", "proposal_sent", "follow_up", "payment_pending", "converted", "lost"]}}
      detailPanel={{"key": "comms", "label": "Comms", "subPath": "interactions", "listColumns": ["channel", "note"], "addFields": [{"key": "note", "label": "Add note"}]}}
      customActions={[{"key": "assign", "label": "Assign", "subPath": "assign", "lockStatuses": ["converted", "lost"], "fields": [{"key": "lead_owner_id", "label": "Owner staff UUID", "required": true}]}, {"key": "convert", "label": "Convert", "variant": "blue", "subPath": "convert", "lockStatuses": ["converted", "lost"], "confirmTitle": "Convert to school", "confirmBody": "This school becomes a customer. It moves from your sales pipeline to the onboarding team, who will check its details and get it ready to run exams.", "confirmWarn": "This can't be undone."}, {"key": "lost", "label": "Lost", "subPath": "lost", "lockStatuses": ["converted", "lost"], "fields": [{"key": "reason", "label": "Lost reason", "required": true}]}]}
      importConfig={{"subPath": "import", "payloadKey": "leads", "label": "Import", "columns": ["school_name", "city", "email", "phone"], "placeholder": "Delhi Public School, Delhi, dps@x.com, 9876543210"}}
    />
  );
}
