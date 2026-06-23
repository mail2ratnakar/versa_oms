const defaults: Record<string, boolean> = {
  school_portal_enabled: true,
  payment_gateway_live_enabled: false,
  exam_material_release_enabled: false,
  school_material_download_enabled: false,
  result_publication_enabled: false,
  public_certificate_verification_enabled: false,
  bulk_notifications_enabled: false,
  sensitive_exports_enabled: false
};

export function isFeatureEnabled(flag: string) {
  return defaults[flag] ?? false;
}
