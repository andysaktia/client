// Copyright 2017-2018 Jaco Greeff
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.
// @flow

import type { ChainState, ChainGenesis } from '../types';

const createBlock = require('@polkadot/primitives-builder/block');
const encodeHeader = require('@polkadot/primitives-codec/header/encode');
const blake2Asu8a = require('@polkadot/util-crypto/blake2/asU8a');
const trieRoot = require('@polkadot/util-triehash/root');

module.exports = function genesisBlock ({ stateDb, chain }: ChainState): ChainGenesis {
  const block = createBlock({
    header: {
      stateRoot: stateDb.db.trieRoot(),
      extrinsicsRoot: trieRoot([])
    }
  });
  const header = encodeHeader(block.header);
  const hash = blake2Asu8a(header, 256);

  return {
    header: block.header,
    hash
  };
};
