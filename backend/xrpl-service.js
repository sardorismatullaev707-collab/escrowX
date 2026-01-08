import xrpl from 'xrpl';

class XRPLService {
  constructor() {
    this.client = null;
    this.network = process.env.XRPL_NETWORK || 'wss://s.altnet.rippletest.net:51233';
  }

  // Подключение к XRPL
  async connect() {
    if (this.client?.isConnected()) {
      return;
    }
    
    this.client = new xrpl.Client(this.network);
    await this.client.connect();
    console.log('✅ Connected to XRPL:', this.network);
  }

  // Отключение
  async disconnect() {
    if (this.client?.isConnected()) {
      await this.client.disconnect();
      console.log('👋 Disconnected from XRPL');
    }
  }

  // 1. СОЗДАНИЕ ESCROW
  async createEscrow({ amount, invoiceId, refundWindowSeconds }) {
    await this.connect();

    const buyerWallet = xrpl.Wallet.fromSeed(process.env.BUYER_SEED);
    const sellerAddress = process.env.SELLER_ADDRESS;

    // Время окончания (через refundWindowSeconds)
    const cancelAfter = Math.floor(Date.now() / 1000) + refundWindowSeconds;
    const finishAfter = Math.floor(Date.now() / 1000) + 10; // Можно завершить через 10 сек

    // Создание транзакции EscrowCreate
    const escrowTx = {
      TransactionType: 'EscrowCreate',
      Account: buyerWallet.address,
      Destination: sellerAddress,
      Amount: xrpl.xrpToDrops(amount), // XRP -> drops (1 XRP = 1,000,000 drops)
      FinishAfter: finishAfter,
      CancelAfter: cancelAfter,
      DestinationTag: parseInt(invoiceId.replace(/\D/g, '').substring(0, 10)) || 1, // Только цифры
    };

    // Автозаполнение полей (Fee, Sequence)
    const prepared = await this.client.autofill(escrowTx);

    // Подпись транзакции
    const signed = buyerWallet.sign(prepared);

    // Отправка в блокчейн
    const result = await this.client.submitAndWait(signed.tx_blob);

    console.log('✅ Escrow Created:', result.result.hash);

    // Explorer URL
    const explorerUrl = this.network.includes('testnet') 
      ? `https://testnet.xrpl.org/transactions/${result.result.hash}`
      : `https://livenet.xrpl.org/transactions/${result.result.hash}`;

    return {
      success: true,
      txHash: result.result.hash,
      explorerUrl: explorerUrl,
      escrowSequence: prepared.Sequence, // Номер для finish/cancel
    };
  }

  // 2. ЗАВЕРШЕНИЕ ESCROW (товар получен)
  async finishEscrow({ escrowSequence }) {
    await this.connect();

    const buyerAddress = process.env.BUYER_ADDRESS;
    const sellerWallet = xrpl.Wallet.fromSeed(process.env.SELLER_SEED);

    // Транзакция EscrowFinish
    const finishTx = {
      TransactionType: 'EscrowFinish',
      Account: sellerWallet.address, // Продавец забирает деньги
      Owner: buyerAddress, // Кто создал escrow
      OfferSequence: parseInt(escrowSequence), // Номер из createEscrow
    };

    const prepared = await this.client.autofill(finishTx);
    const signed = sellerWallet.sign(prepared);
    const result = await this.client.submitAndWait(signed.tx_blob);

    console.log('✅ Escrow Finished:', result.result.hash);

    const explorerUrl = this.network.includes('testnet')
      ? `https://testnet.xrpl.org/transactions/${result.result.hash}`
      : `https://livenet.xrpl.org/transactions/${result.result.hash}`;

    return {
      success: true,
      txHash: result.result.hash,
      explorerUrl: explorerUrl,
    };
  }

  // 3. ОТМЕНА ESCROW (возврат средств)
  async cancelEscrow({ escrowSequence }) {
    await this.connect();

    const buyerWallet = xrpl.Wallet.fromSeed(process.env.BUYER_SEED);

    // Транзакция EscrowCancel
    const cancelTx = {
      TransactionType: 'EscrowCancel',
      Account: buyerWallet.address, // Покупатель возвращает себе
      Owner: buyerWallet.address, // Кто создал escrow
      OfferSequence: parseInt(escrowSequence),
    };

    const prepared = await this.client.autofill(cancelTx);
    const signed = buyerWallet.sign(prepared);
    const result = await this.client.submitAndWait(signed.tx_blob);

    console.log('✅ Escrow Cancelled:', result.result.hash);

    const explorerUrl = this.network.includes('testnet')
      ? `https://testnet.xrpl.org/transactions/${result.result.hash}`
      : `https://livenet.xrpl.org/transactions/${result.result.hash}`;

    return {
      success: true,
      txHash: result.result.hash,
      explorerUrl: explorerUrl,
    };
  }
}

export default new XRPLService();
