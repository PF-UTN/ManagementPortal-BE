import { readFileSync } from 'fs';
import { join } from 'path';

// Base path
const ASSETS_PATH = join(process.cwd(), 'assets');

// ================== IMAGES ==================
export const Images = {
  DOG_PATH: join(ASSETS_PATH, 'images/dog.png'),

  // Lazy-loaded Data URL
  get DOG_DATAURL() {
    const buffer = readFileSync(this.DOG_PATH);
    return `data:image/png;base64,${buffer.toString('base64')}`;
  },
};

// ================== FONTS ==================
export const Fonts = {
  Roboto: {
    normal: join(ASSETS_PATH, 'fonts', 'Roboto-Regular.ttf'),
    bold: join(ASSETS_PATH, 'fonts', 'Roboto-Medium.ttf'),
    italics: join(ASSETS_PATH, 'fonts', 'Roboto-Italic.ttf'),
    bolditalics: join(ASSETS_PATH, 'fonts', 'Roboto-MediumItalic.ttf'),
  },
};
