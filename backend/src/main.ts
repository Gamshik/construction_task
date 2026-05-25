import { NestFactory } from '@nestjs/core';
import { AppModule } from './infrastructure/nest/App.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Функция инициализации и запуска NestJS веб-приложения (точка входа).
 * Настраивает CORS, глобальные префиксы маршрутов, пайплайны валидации входящих DTO и документацию Swagger.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Настройка политики CORS для возможности выполнения кросс-доменных запросов с фронтенда
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 2. Глобальный префикс маршрутизации: все эндпоинты будут начинаться с /api/
  app.setGlobalPrefix('api');

  // 3. Подключение пайплайна валидации для контроля входящих DTO
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Автоматическое преобразование типов (строка -> число в query)
      whitelist: true, // Игнорирование (удаление) свойств, не описанных в DTO
    }),
  );

  // 4. Настройка автоматической интерактивной документации Swagger
  const config = new DocumentBuilder()
    .setTitle('Construction Work Log API')
    .setDescription('Интерфейс API для учета ежедневных объемов выполненных строительных работ на объектах')
    .setVersion('1.0')
    .addTag('work-logs')
    .addTag('work-types')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 5. Запуск прослушивания HTTP-порта
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
  console.log(`Swagger documentation is available at: http://localhost:${port}/api/docs`);
}
bootstrap();

