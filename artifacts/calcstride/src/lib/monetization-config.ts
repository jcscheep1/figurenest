import { ADSENSE_CLIENT_ID } from './adsense';

const env = import.meta.env ?? {};

export const monetizationConfig = {
  adsenseClientId: ADSENSE_CLIENT_ID,
  adsenseFooterSlot: env.VITE_ADSENSE_FOOTER_SLOT_ID?.trim(),
  verificationMetaName: env.VITE_VERIFICATION_META_NAME?.trim(),
  verificationCode: env.VITE_VERIFICATION_CODE?.trim(),
};

export const isProduction = import.meta.env?.PROD === true;