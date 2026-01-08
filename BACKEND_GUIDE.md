# 🔧 Backend API для XRPL Escrow

## Быстрый старт

```bash
# 1. Создать папку backend
mkdir backend && cd backend

# 2. Инициализировать проект
npm init -y

# 3. Установить зависимости
npm install express cors dotenv xrpl
npm install -D nodemon

# 4. Создать .env файл (см. ниже)

# 5. Запустить
npm start
```

## Структура файлов

```
backend/
├── server.js           # Express сервер
├── xrpl-service.js     # Логика XRPL
├── .env               # Приватные ключи (НЕ коммитить!)
├── .gitignore         # Игнорировать .env
└── package.json
```

## .env файл

```env
XRPL_NETWORK=wss://s.altnet.rippletest.net:51233
BUYER_SEED=sEdV19...   # Получить на xrpl.org/xrp-testnet-faucet
BUYER_ADDRESS=rN7n7...
SELLER_SEED=sEdSKa...
SELLER_ADDRESS=rLHzPs...
PORT=3001
```

## API Endpoints

### POST /api/escrow/create
```json
Request: {"amount": 10, "invoiceId": "INV-123", "refundWindowSeconds": 120}
Response: {"success": true, "txHash": "...", "escrowSequence": 12345}
```

### POST /api/escrow/finish
```json
Request: {"escrowSequence": 12345}
Response: {"success": true, "txHash": "..."}
```

### POST /api/escrow/cancel
```json
Request: {"escrowSequence": 12345}
Response: {"success": true, "txHash": "..."}
```

## Как получить testnet кошельки

1. Открыть https://xrpl.org/xrp-testnet-faucet.html
2. Нажать "Generate" для buyer кошелька
3. Скопировать Address и Secret в .env
4. Повторить для seller кошелька
5. Кошельки уже пополнены 1000 XRP (testnet)

## Production checklist

- [ ] Использовать mainnet: `wss://xrplcluster.com`
- [ ] Реальные кошельки с XRP
- [ ] HTTPS для API
- [ ] Rate limiting
- [ ] Логирование в файл
- [ ] Мониторинг
- [ ] Backup приватных ключей
