// Copyright 2017-2019 @polkadot/client-chains authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ProgressCb, ProgressValue, TxDb } from '@polkadot/db/types';
import { Config } from '@polkadot/client/types';
import { ChainLoader } from '@polkadot/client-chains/types';
import { BlockDb, StateDb, ChainDbs, DbConfig } from './types';

import path from 'path';
import MemoryDb from '@polkadot/db/Memory';
import TrieDb from '@polkadot/trie-db';
import { u8aToHex } from '@polkadot/util';

import DiskDb from './DiskDb';
import createBlockDb from './block';
import createStateDb from './state';

const SPINNER = ['|', '/', '-', '\\'];
const PREPEND = '                                     ';

export default class Dbs implements ChainDbs {
  readonly blocks: BlockDb;
  readonly state: StateDb;
  private basePath: string;
  private config: DbConfig;

  constructor ({ db, sync }: Config, chain: ChainLoader) {
    this.config = db;
    this.basePath = db.type !== 'memory'
      ? path.join(db.path, 'chains', chain.id, u8aToHex(chain.genesisRoot), db.type)
      : '';
    const isMemory = this.config.type === 'memory';
    const isLight = sync === 'light';

    this.blocks = createBlockDb(
      this.createBackingDb(`${isLight ? 'header' : 'block'}.db`, isMemory)
    );
    this.state = createStateDb(
      new TrieDb(
        this.createBackingDb('state.db', isMemory || isLight)
      )
    );

    this.blocks.db.open();
    this.state.db.open();
  }

  private createBackingDb (name: string, isMemory: boolean): TxDb {
    const isNative = this.config.type === 'file';

    return isMemory
      ? new MemoryDb()
      : new DiskDb(this.basePath, name, { isCompressed: false, isLru: true, isNative });
  }

  close (): void {
    this.blocks.db.close();
    this.state.db.close();
  }

  snapshot (): void {
    if (!this.config.snapshot) {
      return;
    }

    const newDb = new TrieDb(
      this.createBackingDb('state.db.snapshot', false)
    );

    newDb.open();

    this.state.db.snapshot(newDb, this.createProgress());
    this.state.db.close();
    this.state.db.rename(this.basePath, `state.db.backup-${Date.now()}`);

    newDb.close();
    newDb.rename(this.basePath, 'state.db');
    newDb.open();

    this.state.db = newDb;
  }

  private createProgress (): ProgressCb {
    let lastUpdate = 0;
    let spin = 0;

    return (progress: ProgressValue): void => {
      const now = Date.now();

      if ((now - lastUpdate) > 200) {
        const percent = `      ${progress.percent.toFixed(2)}`.slice(-6);
        const keys = progress.keys > 9999
          ? `${(progress.keys / 1000).toFixed(2)}k`
          : progress.keys;

        process.stdout.write(`${PREPEND}${SPINNER[spin % SPINNER.length]} ${percent}%, ${keys} keys\r`);

        lastUpdate = now;
        spin++;
      }
    };
  }
}