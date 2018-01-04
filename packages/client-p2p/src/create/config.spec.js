// ISC, Copyright 2017-2018 Jaco Greeff

const Railing = require('libp2p-railing');
const PeerInfo = require('peer-info');

const isInstanceOf = require('@polkadot/util/is/instanceOf');
const promisify = require('@polkadot/util/promisify');

const createConfig = require('./config');

describe('createConfig', () => {
  let peerInfo;

  beforeEach(async () => {
    peerInfo = await promisify(null, PeerInfo.create, { bits: 0 });
  });

  it('uses Railing when bootnodes available', () => {
    expect(
      isInstanceOf(
        createConfig(
          peerInfo, ['/ip4/127.0.0.1/tcp/6677']
        ).discovery[1],
        Railing
      )
    ).toEqual(true);
  });

  it('does not Railing when no bootnodes', () => {
    expect(
      createConfig(peerInfo).discovery
    ).toHaveLength(1);
  });
});
