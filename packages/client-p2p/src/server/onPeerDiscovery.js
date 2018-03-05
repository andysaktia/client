// Copyright 2017-2018 Jaco Greeff
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.
// @flow

import type { PeerInterface } from '../types';
import type { P2pState } from './types';

const promisify = require('@polkadot/util/promisify');

const defaults = require('../defaults');

module.exports = function onPeerDiscovery (self: P2pState): void {
  // flowlint-next-line unclear-type:off
  self.peers.on('discovered', async (peer: PeerInterface): any => {
    try {
      const connection = await promisify(self.node, self.node.dial, peer.peerInfo, defaults.PROTOCOL);

      peer.addConnection(connection);
    } catch (error) {
      return false;
    }

    return true;
  });
};
