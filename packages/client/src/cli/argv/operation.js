// ISC, Copyright 2017 Jaco Greeff
// @flow

import type { Options } from 'yargs';

const allRoles = require('@polkadot/primitives/role/all');
const chains = require('@polkadot/client-chains/chains');
const chainDefaults = require('@polkadot/client-chains/defaults');

const allChains = Object.keys(chains).map((chain) => `'${chain}'`);

module.exports = ({
  chain: {
    default: chainDefaults.MAIN,
    description: `Use the chain specified, one of ${allChains.join(', ')} or custom '<chain>.json'`,
    type: 'string'
  },
  role: {
    choices: ((Object.keys(allRoles): any): Array<mixed>),
    default: 'none',
    description: 'Sets the type of role the node operates as',
    type: 'string'
  }
}: { [key: string]: Options });
