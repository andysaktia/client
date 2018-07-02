// Copyright 2017-2018 @polkadot/client-p2p authors & contributors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

import { PeerState } from './types';

import Pushable from 'pull-pushable';
import pull from 'pull-stream';
import Status from '@polkadot/client-p2p-messages/Status';

import defaults from '../defaults';
import receive from './receive';
import send from './send';

export default function addConnection (self: PeerState, connection: LibP2pConnection, isWritable: boolean): void {
  receive(self, connection);

  if (isWritable) {
    self.pushable = Pushable();

    pull(
      self.pushable,
      connection
    );

    send(self, new Status({
      roles: self.config.roles,
      bestNumber: self.chain.blocks.bestNumber.get(),
      bestHash: self.chain.blocks.bestHash.get(),
      genesisHash: self.chain.genesis.headerHash,
      version: defaults.PROTOCOL_VERSION
    }));
  }
}