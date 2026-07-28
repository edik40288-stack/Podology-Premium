export function repairMojibake(value: string) {
  const text = value?.toString().trim() ?? '';
  if (!looksLikeMojibake(text)) return text;
  const candidates = [text, decodeLatin1Utf8(text), decodeCp1251Utf8(text)].filter((entry): entry is string => Boolean(entry));
  return candidates.sort((a, b) => textQualityScore(b) - textQualityScore(a))[0] ?? text;
}

export function repairOptionalMojibake(value?: string) {
  const text = repairMojibake(value?.toString() ?? '');
  return text === '' ? undefined : text;
}

export function looksLikeMojibake(value: string) {
  return /[ÐÑ]|â[€‚]|Â/.test(value);
}

function decodeLatin1Utf8(value: string) {
  try {
    const output = Buffer.from(value, 'latin1').toString('utf8');
    return output.includes('\uFFFD') ? null : output;
  } catch {
    return null;
  }
}

function decodeCp1251Utf8(value: string) {
  try {
    const bytes: number[] = [];
    for (const char of value) {
      const byte = cp1251Byte(char.codePointAt(0) ?? 0);
      if (byte === null) return null;
      bytes.push(byte);
    }
    const output = Buffer.from(bytes).toString('utf8');
    return output.includes('\uFFFD') ? null : output;
  } catch {
    return null;
  }
}

function cp1251Byte(code: number): number | null {
  if (code >= 0x0410 && code <= 0x044f) return code - 0x0410 + 0xc0;
  if (code === 0x0401) return 0xa8;
  if (code === 0x0451) return 0xb8;
  if (code >= 0 && code <= 0x7f) return code;
  const extra: Record<number, number> = {
    0x0402: 0x80, 0x0403: 0x81, 0x201a: 0x82, 0x0453: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87,
    0x20ac: 0x88, 0x2030: 0x89, 0x0409: 0x8a, 0x2039: 0x8b, 0x040a: 0x8c, 0x040c: 0x8d, 0x040b: 0x8e, 0x040f: 0x8f,
    0x0452: 0x90, 0x2018: 0x91, 0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
    0x2122: 0x99, 0x0459: 0x9a, 0x203a: 0x9b, 0x045a: 0x9c, 0x045c: 0x9d, 0x045b: 0x9e, 0x045f: 0x9f,
    0x00a0: 0xa0, 0x040e: 0xa1, 0x045e: 0xa2, 0x0408: 0xa3, 0x00a4: 0xa4, 0x0490: 0xa5, 0x00a6: 0xa6, 0x00a7: 0xa7,
    0x00a9: 0xa9, 0x0404: 0xaa, 0x00ab: 0xab, 0x00ac: 0xac, 0x00ad: 0xad, 0x00ae: 0xae, 0x0407: 0xaf,
    0x00b0: 0xb0, 0x00b1: 0xb1, 0x0406: 0xb2, 0x0456: 0xb3, 0x0491: 0xb4, 0x00b5: 0xb5, 0x00b6: 0xb6, 0x00b7: 0xb7,
    0x2116: 0xb9, 0x0454: 0xba, 0x00bb: 0xbb, 0x0458: 0xbc, 0x0405: 0xbd, 0x0455: 0xbe, 0x0457: 0xbf,
  };
  return extra[code] ?? null;
}

function textQualityScore(value: string) {
  let score = 0;
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if ((code >= 0x0410 && code <= 0x044f) || code === 0x0401 || code === 0x0451) score += 2;
    if (code >= 0x20 && code <= 0x7e) score += 1;
  }
  if (looksLikeMojibake(value)) score -= 80;
  return score;
}
