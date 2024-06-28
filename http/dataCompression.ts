import * as lzString from 'lz-string';

export function decompressData(data: string): string {
  if (data.startsWith('lz:')) {
    const compressedData = data.slice(3);
    return lzString.decompress(compressedData);
  } else {
    return data;
  }
}

export function compressData(value: any): string {
  const compressedValue = lzString.compress(JSON.stringify(value));
  return 'lz:' + compressedValue;
}

