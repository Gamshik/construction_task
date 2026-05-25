import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Инфраструктурный сервис Prisma.
 * Расширяет PrismaClient для управления жизненным циклом подключения к базе данных PostgreSQL.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  /**
   * Инициализация подключения к базе данных при запуске приложения.
   */
  async onModuleInit() {
    await this.$connect();
  }
}

