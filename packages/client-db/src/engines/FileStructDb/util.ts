// Copyright 2017-2019 @polkadot/client-db authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { KeyParts, ParsedHdr, ParsedKey, ValInfo } from './types';

import { blake2AsU8a } from '@polkadot/util-crypto';

import { BITS_F, BITS_U, HDR_ENTRY_SIZE, HDR_TOTAL_SIZE, KEY_DATA_SIZE, KEY_PARTS_SIZE, KEY_TOTAL_SIZE, U32_SIZE } from './defaults';

export function readU8aU32 (u8a: Uint8Array, offset: number): number {
  // reverse the writing, highest bits goes first, lowest are last
  return (u8a[offset] << 24) + (u8a[offset + 1] << 16) + (u8a[offset + 2] << 8) + u8a[offset + 3];
}

export function writeU8aU32 (u8a: Uint8Array, value: number, offset: number): void {
  // write the highest bits first - this way, when flagged, we only need to
  // read a single byte (this is useful in the cases where we re-encode a trie)
  u8a[offset] = (value >> 24) & 0xff;
  u8a[offset + 1] = (value >> 16) & 0xff;
  u8a[offset + 2] = (value >> 8) & 0xff;
  u8a[offset + 3] = value & 0xff;
}

export function modifyHdr (hdr: Uint8Array, hdrIndex: number, linkAt: number, isKey: boolean): Uint8Array {
  writeU8aU32(hdr, isKey ? (linkAt | BITS_F) : linkAt, hdrIndex * HDR_ENTRY_SIZE);

  return hdr;
}

export function modifyKey (keyData: Uint8Array, valAt: number, valSize: number): Uint8Array {
  writeU8aU32(keyData, valAt, KEY_DATA_SIZE);
  writeU8aU32(keyData, valSize, KEY_DATA_SIZE + U32_SIZE);

  return keyData;
}

export function newHdr (indexes: Array<{ dataAt: number, hdrIndex: number, isKey: boolean }>): Uint8Array {
  const hdr = new Uint8Array(HDR_TOTAL_SIZE);

  indexes.forEach(({ dataAt, hdrIndex, isKey }) =>
    modifyHdr(hdr, hdrIndex, dataAt, isKey)
  );

  return hdr;
}

export function newKey (key: KeyParts, { valAt, valSize }: ValInfo): Uint8Array {
  const keyData = new Uint8Array(KEY_TOTAL_SIZE);

  keyData.set(key.buffer, 0);

  return modifyKey(keyData, valAt, valSize);
}

export function parseHdr (hdr: Uint8Array, hdrIndex: number): ParsedHdr {
  const u32 = readU8aU32(hdr, hdrIndex * HDR_ENTRY_SIZE);
  const linkTo = u32 & BITS_U;

  return {
    isKey: linkTo !== u32,
    linkTo
  };
}

export function parseKey (keyData: Uint8Array): ParsedKey {
  return {
    valAt: readU8aU32(keyData, KEY_DATA_SIZE),
    valSize: readU8aU32(keyData, KEY_DATA_SIZE + U32_SIZE)
  };
}

export function serializeKey (u8a: Uint8Array): KeyParts {
  // Convert any non-32-byte keys into a hash of the key. This allows for proper
  // key distribution. In practice, the inputs should already be hashed, in the
  // case of using a trie, however if used directly, this would come into play
  const buffer = u8a.length === KEY_DATA_SIZE
    ? u8a
    : blake2AsU8a(u8a);

  const parts = new Uint8Array(KEY_PARTS_SIZE);
  let offset = 0;

  for (let i = 0; i < KEY_DATA_SIZE; i++) {
    const item = buffer[i];

    parts[offset] = item & 0b1111;
    parts[offset + 1] = item >> 4;
    offset += 2;
  }

  return { buffer, parts };
}