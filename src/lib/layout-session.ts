import { hasEditAccess, isEditAuthConfigured } from "@/lib/auth/edit-access";
import { getSampleDataBannerVisible } from "@/lib/mutations/plan-updates";

export async function getLayoutSession() {
  const [canEdit, showSampleBanner] = await Promise.all([
    hasEditAccess(),
    getSampleDataBannerVisible(),
  ]);

  return {
    canEdit,
    editAuthConfigured: isEditAuthConfigured(),
    showSampleBanner,
  };
}
