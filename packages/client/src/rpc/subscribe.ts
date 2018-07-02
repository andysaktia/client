// Copyright 2017-2018 @polkadot/client authors & contributors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

import { ChainInterface } from '@polkadot/client-chains/types';
import { Config, Endpoint } from '../types';

const newHead = async (): Promise<string> =>
  'chain_newHead';

export default (config: Config, chain: ChainInterface): Endpoint => ({
  'subscribe_newHead': newHead
});