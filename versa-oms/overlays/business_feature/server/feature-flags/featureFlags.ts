const productionDefaults: Record<string, boolean> = {
  school_portal_enabled: false,
  payment_gateway_live_enabled: false,
  exam_material_release_enabled: false,
  school_material_download_enabled: false,
  result_publication_enabled: false,
  certificate_generation_enabled: false,
  public_certificate_verification_enabled: false,
  bulk_notifications_enabled: false,
  sensitive_exports_enabled: false
};

const developmentDefaults: Record<string, boolean> = {
  school_portal_enabled: true,
  payment_gateway_live_enabled: false,
  exam_material_release_enabled: true,
  school_material_download_enabled: true,
  result_publication_enabled: true,
  certificate_generation_enabled: true,
  public_certificate_verification_enabled: true,
  bulk_notifications_enabled: true,
  sensitive_exports_enabled: true
};

export function isFeatureEnabled(flag: string, environment = process.env.APP_ENV ?? "development") {
  const defaults = environment === "production" ? productionDefaults : developmentDefaults;
  return defaults[flag] ?? false;
}
