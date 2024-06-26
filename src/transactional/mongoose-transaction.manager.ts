import { ContextService } from '@gedai/nestjs-core';
import { Transaction, TransactionManager } from '@gedai/nestjs-tactical-design';
import { Injectable, Type } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection } from 'mongoose';

class MongooseTransaction extends Transaction<ClientSession> {
  async begin(): Promise<void> {
    this._hostTransaction.startTransaction();
  }

  async commit(): Promise<void> {
    await this._hostTransaction.commitTransaction();
  }

  async rollback(): Promise<void> {
    await this._hostTransaction.abortTransaction();
  }

  async end(): Promise<void> {
    await this._hostTransaction.endSession();
  }
}

export function MongooseTransactionManager(connectionName?: string): Type<any> {
  @Injectable()
  class MongooseTransactionManagerHost extends TransactionManager {
    constructor(
      protected readonly context: ContextService,
      @InjectConnection(connectionName)
      protected readonly connection: Connection,
    ) {
      super(context);
    }

    async createTransaction(): Promise<Transaction> {
      const session = await this.connection.startSession();
      return new MongooseTransaction(session);
    }
  }

  return MongooseTransactionManagerHost;
}
