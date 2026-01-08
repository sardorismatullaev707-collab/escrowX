import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import xrplService from './xrpl-service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// 📝 Логирование запросов
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// ✅ Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    network: process.env.XRPL_NETWORK,
    timestamp: new Date().toISOString()
  });
});

// 1️⃣ CREATE ESCROW
app.post('/api/escrow/create', async (req, res) => {
  try {
    const { amount, invoiceId, refundWindowSeconds } = req.body;

    // Валидация
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid amount' 
      });
    }

    if (!refundWindowSeconds || refundWindowSeconds <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid refund window' 
      });
    }

    // Создание escrow
    const result = await xrplService.createEscrow({
      amount,
      invoiceId,
      refundWindowSeconds,
    });

    res.json(result);
  } catch (error) {
    console.error('❌ Create escrow error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 2️⃣ FINISH ESCROW
app.post('/api/escrow/finish', async (req, res) => {
  try {
    const { escrowSequence } = req.body;

    if (!escrowSequence) {
      return res.status(400).json({ 
        success: false, 
        error: 'Escrow sequence required' 
      });
    }

    const result = await xrplService.finishEscrow({ escrowSequence });
    res.json(result);
  } catch (error) {
    console.error('❌ Finish escrow error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 3️⃣ CANCEL ESCROW
app.post('/api/escrow/cancel', async (req, res) => {
  try {
    const { escrowSequence } = req.body;

    if (!escrowSequence) {
      return res.status(400).json({ 
        success: false, 
        error: 'Escrow sequence required' 
      });
    }

    const result = await xrplService.cancelEscrow({ escrowSequence });
    res.json(result);
  } catch (error) {
    console.error('❌ Cancel escrow error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 🚀 Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 XRPL Network: ${process.env.XRPL_NETWORK}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down...');
  await xrplService.disconnect();
  process.exit(0);
});
