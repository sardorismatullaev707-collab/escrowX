# XRPL Refund Demo - Frontend

Минимальный демо-готовый фронтенд для управления escrow транзакциями на XRPL (XRP Ledger).

## Технологии

- **React** - UI библиотека
- **TypeScript** - Типизация
- **Vite** - Сборщик и dev-сервер
- **Tailwind CSS** - Стилизация

## Возможности

Приложение предоставляет простой UI для взаимодействия с backend API:

1. **Create Escrow** - создание escrow транзакции с настройками:
   - Amount (сумма в XRP)
   - Invoice ID (уникальный идентификатор)
   - Refund Window (время в секундах для возможности возврата)

2. **Finish Escrow** - завершение escrow (успешная доставка)
   - Требует escrow sequence

3. **Cancel Escrow** - отмена escrow (возврат средств)
   - Требует escrow sequence

4. **Transaction Log** - история последних 5 транзакций с ссылками на XRPL explorer

## Установка

```bash
# Установка зависимостей
npm install
```

## Переменные окружения

Создайте файл `.env` в корне проекта (или скопируйте `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:3001
```

**Переменные:**
- `VITE_API_BASE_URL` - базовый URL backend API (по умолчанию: http://localhost:3001)

## Запуск

```bash
# Dev режим с hot reload
npm run dev
```

Приложение будет доступно по адресу: **http://localhost:5173**

## Сборка для production

```bash
# Сборка оптимизированной версии
npm run build

# Предпросмотр production сборки
npm run preview
```

## Структура проекта

```
frontend/
├── src/
│   ├── api.ts          # API клиент для взаимодействия с backend
│   ├── App.tsx         # Главный компонент приложения
│   ├── App.css         # Стили
│   ├── index.css       # Tailwind импорты
│   └── main.tsx        # Entry point
├── .env                # Переменные окружения
├── package.json        # Зависимости
└── vite.config.ts      # Конфигурация Vite
```

## API Эндпоинты (Backend)

Фронтенд ожидает следующие эндпоинты:

```
POST /api/escrow/create
Body: { amount: number, invoiceId: string, refundWindowSeconds: number }
Response: { success: boolean, txHash: string, explorerUrl: string, escrowSequence: number }

POST /api/escrow/finish
Body: { escrowSequence: number }
Response: { success: boolean, txHash: string, explorerUrl: string }

POST /api/escrow/cancel
Body: { escrowSequence: number }
Response: { success: boolean, txHash: string, explorerUrl: string }
```

## Важные замечания

⚠️ **Безопасность:**
- Фронтенд НЕ хранит приватные ключи
- Фронтенд НЕ подписывает транзакции
- Вся логика подписания происходит на backend

📝 **MVP подход:**
- Нет авторизации/аутентификации
- Нет сложных библиотек или кошельков
- Простой и понятный код для хакатона

## Troubleshooting

**Проблема:** CORS ошибки при запросах к backend

**Решение:** Убедитесь что backend настроен на прием запросов с `http://localhost:5173`

**Проблема:** "Failed to fetch" ошибки

**Решение:** 
1. Проверьте что backend запущен на `http://localhost:3001`
2. Проверьте переменную `VITE_API_BASE_URL` в `.env`
3. Перезапустите dev-сервер после изменения `.env`

## Лицензия

MIT
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
