// ISC, Copyright 2017-2018 Jaco Greeff
// @flow

import type { HandlersType } from '../types';

const assert = require('@polkadot/util/assert');
const isFunction = require('@polkadot/util/is/function');

module.exports = function validateHandlers (handlers: HandlersType = {}): void {
  const handlerKeys = Object.keys(handlers);

  assert(handlerKeys.length !== 0, 'Expected non-empty handler mapping');

  const invalid = handlerKeys
    .filter((key) => !isFunction(handlers[key]))
    .map((key) => `'${key}'`)
    .join(', ');

  assert(invalid.length === 0, `Invalid method handlers found: ${invalid}`);
};
