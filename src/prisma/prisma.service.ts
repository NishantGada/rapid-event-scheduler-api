import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
  }

  async onModuleInit() {
    await (this as PrismaClient).$connect();
  }

  async onModuleDestroy() {
    await (this as PrismaClient).$disconnect();
  }
}