import { Fonts } from '../../constants';

async function fetchFont(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch font: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

export async function getFonts() {
  return {
    Roboto: {
      normal: await fetchFont(Fonts.Roboto.normal),
      bold: await fetchFont(Fonts.Roboto.bold),
      italics: await fetchFont(Fonts.Roboto.italics),
      bolditalics: await fetchFont(Fonts.Roboto.bolditalics),
    },
  };
}
