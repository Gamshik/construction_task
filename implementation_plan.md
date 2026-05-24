# Архитектурный план реализации: Журнал строительных работ (Чистая архитектура)

Этот документ содержит окончательный технический план реализации проекта «Журнал работ на строительном объекте». Архитектурные решения адаптированы под принципы чистой гексагональной архитектуры на бэкенде и модульной структуры на фронтенде.

---

## Архитектура Бэкенда (NestJS + Prisma + PostgreSQL)
Бэкенд спроектирован по канонам **Clean Hexagonal Architecture**. Бизнес-логика полностью изолирована от деталей инфраструктуры (фреймворка, базы данных, сетевых протоколов).

### Схема слоев бэкенда (`backend/src`):
1.  **Domain (Чистые сущности):**
    *   `WorkLog.entity.ts` — бизнес-модель записи с валидацией бизнес-правил.
    *   `WorkType.entity.ts` — бизнес-модель вида работ.
2.  **Application (Use Cases & Ports):**
    *   `/ports` — контракты для взаимодействия. Выходные порты (интерфейсы репозиториев) и входные порты (интерфейсы юзкейсов).
    *   `/use-cases` — чистая реализация бизнес-логики сценариев. Зависит только от сущностей и интерфейсов портов.
3.  **Infrastructure (Адаптеры):**
    *   `/controllers` — веб-адаптеры для HTTP API + DTO для валидации запросов.
    *   `/repositories` — persistence-адаптеры для работы с базой данных через Prisma ORM + мапперы для преобразования сущностей.
    *   `/nest` — конфигурация модулей NestJS для сборки Dependency Injection.

---

## Архитектура Фронтенда (React + TypeScript + Vite + SASS)
Фронтенд спроектирован по модульному принципу для обеспечения гибкости и отсутствия коллизий стилей.

### Схема слоев фронтенда (`frontend/src`):
1.  **UI Kit (`components/`):** Базовые переиспользуемые атомарные компоненты (Button, Input, Loader, Modal) со своими SCSS-модулями.
2.  **Features (`features/`):** Бизнес-фичи приложения. Фича `/work-logs` содержит свои локальные компоненты (таблица, форма, фильтры) и кастомные хуки.
3.  **API Layer (`api/`):** Изолированный слой сетевых запросов. Запросы и мутации построены на базе **TanStack Query (React Query)** для кэширования серверного состояния.
4.  **Styles (`styles/`):** Глобальные стили, переменные HSL для темной/светлой темы и миксины для Glassmorphism.

---

## Подробная структура файлов проекта

```text
/construction_task
  ├── docker-compose.yml              # Запуск PostgreSQL в Docker
  ├── package.json                    # Скрипты запуска всего проекта одной командой
  ├── README.md                       # Инструкция по установке и запуску
  │
  ├── /backend                        # Приложение NestJS
  │     ├── /prisma
  │     │     ├── schema.prisma       # Схема БД (Реляционные таблицы)
  │     │     └── seed.ts             # Наполнение справочника видов работ в БД
  │     ├── /src
  │     │     ├── /domain             # Чистый домен (Entities)
  │     │     │     ├── WorkLog.entity.ts
  │     │     │     └── WorkType.entity.ts
  │     │     │
  │     │     ├── /application        # Use Cases & Interfaces
  │     │     │     ├── /ports
  │     │     │     │     ├── WorkLogRepository.interface.ts
  │     │     │     │     ├── WorkTypeRepository.interface.ts
  │     │     │     │     └── CreateWorkLog.usecase.ts
  │     │     │     └── /use-cases
  │     │     │           ├── CreateWorkLog.service.ts
  │     │     │           ├── GetWorkLogs.service.ts
  │     │     │           ├── DeleteWorkLog.service.ts
  │     │     │           └── GetWorkTypes.service.ts
  │     │     │
  │     │     ├── /infrastructure     # Адаптеры инфраструктуры
  │     │     │     ├── /controllers
  │     │     │     │     ├── WorkLog.controller.ts
  │     │     │     │     ├── WorkType.controller.ts
  │     │     │     │     └── /dto
  │     │     │     │           ├── CreateWorkLog.dto.ts
  │     │     │     │           └── UpdateWorkLog.dto.ts
  │     │     │     ├── /repositories
  │     │     │     │     ├── PrismaWorkLog.repository.ts
  │     │     │     │     ├── PrismaWorkType.repository.ts
  │     │     │     │     ├── Prisma.service.ts
  │     │     │     │     └── /mappers
  │     │     │     │           ├── WorkLog.mapper.ts
  │     │     │     │           └── WorkType.mapper.ts
  │     │     │     └── /nest
  │     │     │           ├── App.module.ts
  │     │     │           ├── WorkLog.module.ts
  │     │     │           └── WorkType.module.ts
  │     │     └── main.ts
  │     └── package.json
  │
  └── /frontend                       # Приложение React (Vite)
        ├── /src
        │     ├── /api
        │     │     ├── client.ts
        │     │     └── workLogsApi.ts
        │     ├── /components
        │     │     ├── /Button
        │     │     │     ├── Button.tsx
        │     │     │     └── Button.module.scss
        │     │     └── /Loader
        │     │           ├── Skeleton.tsx
        │     │           └── Skeleton.module.scss
        │     ├── /features
        │     │     └── /work-logs
        │     │           ├── /components
        │     │           │     ├── /WorkLogTable
        │     │           │     │     ├── WorkLogTable.tsx
        │     │           │     │     ├── WorkLogTable.module.scss
        │     │           │     │     └── WorkLogTableRow.tsx
        │     │           │     ├── /WorkLogForm
        │     │           │     │     ├── WorkLogForm.tsx
        │     │           │     │     └── WorkLogForm.module.scss
        │     │           │     └── /WorkLogFilters
        │     │           │           ├── WorkLogFilters.tsx
        │     │           │           └── WorkLogFilters.module.scss
        │     │           └── /hooks
        │     │                 └── useWorkLogFilters.ts
        │     ├── /styles
        │     │     ├── _variables.scss
        │     │     ├── _mixins.scss
        │     │     └── global.scss
        │     ├── App.tsx
        │     ├── main.tsx
        │     └── vite-env.d.ts
        └── package.json
```

---

## План Валидации и Тестирования

### Автоматическая проверка:
1.  **Swagger:** Интерактивное тестирование всех эндпоинтов по адресу `http://localhost:3000/api/docs`.
2.  **Валидация DTO:** Проверка корректности работы NestJS `ValidationPipe` на пограничных некорректных значениях (400 Bad Request с подробным описанием).

### Ручная проверка:
1.  **Скелетоны и Загрузка:** Проверка плавного отображения скелетонов при медленной сети во время получения данных.
2.  **Интерактивность:** Полный CRUD-цикл без ручной перезагрузки страницы (автоматическое обновление кэша через TanStack Query).
3.  **Адаптивность:** Проверка адаптивности таблиц и Drawer-панели на мобильных устройствах.
