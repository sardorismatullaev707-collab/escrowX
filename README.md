# 🚀 XRPL Escrow Demo - Hackathon Project

> Децентрализованная система условного депонирования на XRP Ledger для безопасных платежей

[![XRPL](https://img.shields.io/badge/XRPL-Testnet-blue)](https://xrpl.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 🎯 Проблема

При онлайн-покупках и услугах:
- 💸 Покупатель рискует не получить товар/услугу
- 🏪 Продавец боится не получить оплату
- 🏦 Традиционные escrow-сервисы берут высокие комиссии (3-5%)

## 💡 Решение

Умное депонирование на блокчейне XRPL:
- ✅ Деньги блокируются до выполнения условий
- ✅ Автоматический возврат при проблемах
- ✅ Без посредников и высоких комиссий
- ✅ Быстро (3-5 сек) и дешево ($0.00001)

## 🎬 Демо

**Попробуйте прямо сейчас:**

```bash
# Frontend
cd frontend
npm install
npm run dev
# Откройте http://localhost:5173

# Backend (если есть)
cd backend
npm install
npm start
# API на http://localhost:3001
```

## ✨ Возможности

### 1️⃣ Create Escrow
Создание условного депозита с параметрами:
- 💰 Сумма в XRP
- 🔖 ID транзакции (invoice)
- ⏱️ Окно для возврата (refund window)

### 2️⃣ Finish Escrow
Успешное завершение — деньги переводятся продавцу после подтверждения доставки.

### 3️⃣ Cancel Escrow
Отмена и возврат средств если товар не доставлен или возникли проблемы.

### 4️⃣ Transaction Log
История всех операций с ссылками на XRPL Explorer для прозрачности.

## 🏗️ Архитектура

```
┌──────────────┐      HTTP      ┌──────────────┐      XRPL SDK      ┌──────────────┐
│              │  ──────────►    │              │  ─────────────►    │              │
│   Frontend   │                 │   Backend    │                    │ XRPL Testnet │
│ React + TS   │  ◄──────────    │   Node.js    │  ◄─────────────    │  Blockchain  │
│              │      JSON       │              │     TX Result      │              │
└──────────────┘                 └──────────────┘                    └──────────────┘
```

## 🛠️ Технологии

### Frontend
- **React 18** — UI библиотека
- **TypeScript** — типизация
- **Vite** — быстрый bundler
- **Tailwind CSS** — современные стили

### Backend
- **Node.js** — runtime
- **Express** — web framework
- **xrpl.js** — XRPL SDK

### Blockchain
- **XRPL Testnet** — для демонстрации
- **Native Escrow** — встроенная функциональность XRPL

## 📊 Метрики

| Параметр | Значение |
|----------|----------|
| ⚡ Скорость транзакции | 3-5 секунд |
| 💰 Комиссия | ~$0.00001 |
| 🔒 Безопасность | Децентрализованный блокчейн |
| 🌍 Доступность | 24/7 глобально |
| 📈 Пропускная способность | 1500+ TPS |

## 🔐 Безопасность

- ✅ Приватные ключи **ТОЛЬКО** на backend
- ✅ Frontend не может подписывать транзакции
- ✅ Все операции валидируются на сервере
- ✅ HTTPS для всех запросов
- ✅ Escrow живет в блокчейне (не зависит от нашего сервера)

## 📚 Документация

- 📖 [**DEMO_GUIDE.md**](DEMO_GUIDE.md) — Подробный гайд для презентации (5 мин демо)
- ⚡ [**CHEAT_SHEET.md**](CHEAT_SHEET.md) — Быстрая шпаргалка
- 📊 [**VISUAL_GUIDE.md**](VISUAL_GUIDE.md) — Диаграммы и визуальные объяснения
- 🎨 [**frontend/README.md**](frontend/README.md) — Документация фронтенда

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- npm или yarn
- XRPL Testnet кошелек (для backend)

### Установка

```bash
# 1. Клонируем репозиторий
git clone <your-repo>
cd xrpl-escrow-demo

# 2. Устанавливаем frontend
cd frontend
npm install
cp .env.example .env

# 3. Запускаем frontend
npm run dev
# → http://localhost:5173

# 4. (Опционально) Backend
cd ../backend
npm install
cp .env.example .env
# Настройте XRPL кошельки в .env
npm start
# → http://localhost:3001
```

### Конфигурация

**Frontend (.env):**
```env
VITE_API_BASE_URL=http://localhost:3001
```

**Backend (.env):**
```env
XRPL_NETWORK=testnet
BUYER_SEED=s...
SELLER_SEED=s...
PORT=3001
```

## 🎯 Use Cases

1. **E-commerce** — Защита покупателя и продавца
2. **Фриланс** — Оплата после сдачи работы
3. **Аренда** — Депозит с автовозвратом
4. **P2P сделки** — Безопасный обмен между незнакомцами
5. **Микрозаймы** — Автоматическое погашение

## 🤝 Для жюри хакатона

### Что реализовано:
- ✅ Полностью рабочий UI/UX
- ✅ Интеграция с XRPL Testnet
- ✅ Три основные операции (Create/Finish/Cancel)
- ✅ Transaction log с историей
- ✅ Ссылки на XRPL Explorer
- ✅ Адаптивный дизайн (mobile-friendly)
- ✅ TypeScript типизация
- ✅ Обработка ошибок

### Что можно улучшить:
- ⏳ Подключение реальных кошельков (MetaMask-style)
- ⏳ Multi-signature escrow
- ⏳ Уведомления (email/push)
- ⏳ Arbitration система при спорах
- ⏳ Analytics dashboard

## 📈 Roadmap

**Phase 1 (MVP):** ✅ Текущая версия
- Базовый escrow функционал
- Простой UI
- Testnet интеграция

**Phase 2 (Beta):**
- Mainnet запуск
- Кошелек интеграция (XUMM)
- Advanced escrow с условиями

**Phase 3 (Production):**
- Marketplace интеграция
- API для e-commerce платформ
- Mobile apps

## 🏆 Преимущества перед конкурентами

| Функция | PayPal | Escrow.com | **Наше решение** |
|---------|--------|------------|------------------|
| Комиссия | 2.9% | 3.25% | **$0.00001** |
| Скорость | Мгновенно | 1-5 дней | **3-5 сек** |
| Децентрализация | ❌ | ❌ | **✅** |
| Прозрачность | ❌ | Частичная | **✅ Blockchain** |
| Доступность | KYC требуется | KYC требуется | **Без KYC** |

## 📞 Контакты

- **GitHub:** [your-github]
- **Email:** your-email@example.com
- **Demo:** [Live Demo Link]

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE)

---

**Сделано с ❤️ для NUS Hackathon 2026**

*"Trustless payments for everyone"*
