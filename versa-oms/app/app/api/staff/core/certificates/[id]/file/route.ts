// Staff secure download of a certificate's PDF (FR-CERT-PDF-0005). Custom sub-route; scope +
// signed-URL + audit live in the shared factory. Gated to generated/published/downloaded.
import { makeSecureDownloadHandler } from "@/server/lib/routeHandlers";
import * as service from "@/server/modules/core_certificates/service";

export const { GET } = makeSecureDownloadHandler("core_certificates", service, {
  fileColumn: "pdf_file",
  scope: "staff",
  gateColumn: "status",
  gateValues: ["generated", "published", "downloaded"],
});
