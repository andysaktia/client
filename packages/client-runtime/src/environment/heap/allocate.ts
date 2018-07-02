// Copyright 2017-2018 @polkadot/client-runtime authors & contributors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

import { Pointer } from '../../types';
import { Memory } from './types';

import freealloc from './freealloc';

export default function allocate (memory: Memory, size: number): Pointer {
  if (size === 0) {
    return 0;
  }

  const ptr = memory.offset;
  const offset = ptr + size;

  if (offset < memory.size) {
    memory.offset = offset;
    memory.allocated[ptr] = size;

    return ptr;
  }

  return freealloc(memory, size);
}