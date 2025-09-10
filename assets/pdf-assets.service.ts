import { readFileSync } from 'fs';
import { join } from 'path';

// Helper function to convert image to base64
function loadImage(filename: string): string {
  const filePath = join(__dirname, '../assets/images', filename);
  const buffer = readFileSync(filePath);
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

// Fonts paths
const fontsBase = join(__dirname, '../assets/fonts');

export const PdfAssets = {
  logo: loadImage('dog.png'),
  fonts: {
    Roboto: {
      normal: join(fontsBase, 'Roboto-Regular.ttf'),
      bold: join(fontsBase, 'Roboto-Medium.ttf'),
      italics: join(fontsBase, 'Roboto-Italic.ttf'),
      bolditalics: join(fontsBase, 'Roboto-MediumItalic.ttf'),
    },
  },
};
