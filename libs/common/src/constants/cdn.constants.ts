export const CDN_BASE_URL =
  'https://rykocsrdf1gsyk57.public.blob.vercel-storage.com';

// ========== IMAGES ==========
export const CDN_IMAGES_URL = `${CDN_BASE_URL}/images`;

export const DOG_URL = `${CDN_IMAGES_URL}/dog.png`;

// ========== FONTS ==========
export const CDN_FONTS_URL = `${CDN_BASE_URL}/fonts`;

export const Fonts = {
  Roboto: {
    normal: `${CDN_FONTS_URL}/Roboto-Regular.ttf`,
    bold: `${CDN_FONTS_URL}/Roboto-Medium.ttf`,
    italics: `${CDN_FONTS_URL}/Roboto-Italic.ttf`,
    bolditalics: `${CDN_FONTS_URL}/Roboto-MediumItalic.ttf`,
  },
};
