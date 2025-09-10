import { readFileSync } from 'fs';
import { join } from 'path';

// Base path
const ASSETS_PATH = join(process.cwd(), 'assets');

// ================== IMAGES ==================
export const Images = {
  DOG_DATAURL: `data:image/png;base64,${readFileSync(join(ASSETS_PATH, 'images/dog.png')).toString('base64')}`,

  DOG_PATH: join(ASSETS_PATH, 'images/dog.png'),
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
