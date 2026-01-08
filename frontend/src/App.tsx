import { useState } from 'react';
import { api } from './api';
import type { EscrowResponse } from './api';
import { useXamanWallet } from './useXamanWallet';
import './App.css';

interface TransactionLog {
  id: string;
  timestamp: Date;
  action: 'create' | 'finish' | 'cancel';
  txHash?: string;
  explorerUrl?: string;
  status: 'success' | 'error';
  error?: string;
}

function App() {
  // Xaman Wallet
  const { wallet, connecting, connect, disconnect } = useXamanWallet();

  // Demo mode detection
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Create Escrow state
  const [amount, setAmount] = useState('10');
  const [invoiceId, setInvoiceId] = useState(`INV-${Date.now()}`);
  const [refundWindowSeconds, setRefundWindowSeconds] = useState('120');
  const [createLoading, setCreateLoading] = useState(false);
  const [createResult, setCreateResult] = useState<EscrowResponse | null>(null);

  // Finish/Cancel Escrow state
  const [escrowSequence, setEscrowSequence] = useState('');
  const [finishLoading, setFinishLoading] = useState(false);
  const [finishResult, setFinishResult] = useState<EscrowResponse | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelResult, setCancelResult] = useState<EscrowResponse | null>(null);

  // Transaction log
  const [transactionLog, setTransactionLog] = useState<TransactionLog[]>([]);

  const addToLog = (action: 'create' | 'finish' | 'cancel', result: EscrowResponse, error?: string) => {
    const logEntry: TransactionLog = {
      id: `${action}-${Date.now()}`,
      timestamp: new Date(),
      action,
      txHash: result.txHash,
      explorerUrl: result.explorerUrl,
      status: result.success ? 'success' : 'error',
      error: error || result.error,
    };
    setTransactionLog((prev) => [logEntry, ...prev].slice(0, 5));
  };

  const handleCreateEscrow = async () => {
    const amountNum = parseFloat(amount);
    const refundWindow = parseInt(refundWindowSeconds);

    if (amountNum <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    if (refundWindow <= 0) {
      alert('Refund window must be greater than 0');
      return;
    }

    setCreateLoading(true);
    setCreateResult(null);

    try {
      const result = await api.createEscrow({
        amount: amountNum,
        invoiceId,
        refundWindowSeconds: refundWindow,
      });

      setCreateResult(result);
      if (result.escrowSequence) {
        setEscrowSequence(result.escrowSequence.toString());
      }
      if (result.message?.includes('Demo mode')) {
        setIsDemoMode(true);
      }
      addToLog('create', result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorResult: EscrowResponse = {
        success: false,
        error: errorMessage,
      };
      setCreateResult(errorResult);
      addToLog('create', errorResult, errorMessage);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleFinishEscrow = async () => {
    const sequence = parseInt(escrowSequence);

    if (!sequence || sequence <= 0) {
      alert('Please enter a valid escrow sequence');
      return;
    }

    setFinishLoading(true);
    setFinishResult(null);

    try {
      const result = await api.finishEscrow({ escrowSequence: sequence });
      setFinishResult(result);
      addToLog('finish', result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorResult: EscrowResponse = {
        success: false,
        error: errorMessage,
      };
      setFinishResult(errorResult);
      addToLog('finish', errorResult, errorMessage);
    } finally {
      setFinishLoading(false);
    }
  };

  const handleCancelEscrow = async () => {
    const sequence = parseInt(escrowSequence);

    if (!sequence || sequence <= 0) {
      alert('Please enter a valid escrow sequence');
      return;
    }

    setCancelLoading(true);
    setCancelResult(null);

    try {
      const result = await api.cancelEscrow({ escrowSequence: sequence });
      setCancelResult(result);
      addToLog('cancel', result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorResult: EscrowResponse = {
        success: false,
        error: errorMessage,
      };
      setCancelResult(errorResult);
      addToLog('cancel', errorResult, errorMessage);
    } finally {
      setCancelLoading(false);
    }
  };

  const ResultDisplay = ({ result }: { result: EscrowResponse | null }) => {
    if (!result) return null;

    return (
      <div className={`mt-6 p-6 rounded-2xl border-2 ${
        result.success 
          ? 'bg-green-500/20 border-green-400' 
          : 'bg-red-500/20 border-red-400'
      }`}>
        <div className="text-2xl font-bold mb-3 flex items-center gap-3">
          {result.success ? (
            <>
              <span className="text-4xl">✅</span>
              <span className="text-green-300">Success!</span>
            </>
          ) : (
            <>
              <span className="text-4xl">❌</span>
              <span className="text-red-300">Error</span>
            </>
          )}
        </div>
        {result.error && (
          <div className="text-red-200 text-lg mb-3 font-medium bg-red-900/30 p-4 rounded-xl">
            {result.error}
          </div>
        )}
        {result.txHash && (
          <div className="mb-3 bg-slate-900/50 p-4 rounded-xl">
            <div className="text-slate-300 font-semibold mb-2 text-sm">📝 Transaction ID:</div>
            <code className="text-blue-300 text-xs font-mono block break-all">
              {result.txHash}
            </code>
          </div>
        )}
        {result.explorerUrl && (
          <a
            href={result.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all text-lg"
          >
            🔍 View on Blockchain
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        )}
        {result.escrowSequence && (
          <div className="mt-4 pt-4 border-t-2 border-white/20">
            <div className="text-slate-300 font-semibold mb-2">🔢 Sequence for next steps:</div>
            <div className="bg-purple-500/20 border-2 border-purple-400 rounded-xl p-4">
              <code className="text-purple-300 text-2xl font-bold">
                {result.escrowSequence}
              </code>
            </div>
            <div className="text-slate-400 text-sm mt-2">
              ✓ Auto-filled in fields below
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Logo in top-right corner */}
        <div className="absolute top-6 right-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 rounded-2xl shadow-2xl border-2 border-white/20 backdrop-blur-sm">
            <span className="text-white font-black text-2xl tracking-tight">EscrowX</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              Secure Escrow Payments
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-2">Lock Funds → Receive Goods → Release Payment</p>
          <p className="text-slate-400 mb-6">If something goes wrong — automatic refund</p>

          {/* Wallet Connection */}
          <div className="flex justify-center">
            {!wallet.connected ? (
              <button
                onClick={connect}
                disabled={connecting}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-orange-500/50 disabled:shadow-none transform hover:scale-105"
              >
                {connecting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                    </svg>
                    Connect Xaman Wallet
                  </>
                )}
              </button>
            ) : (
              <div className="inline-flex items-center gap-4 bg-slate-800/60 backdrop-blur-xl border-2 border-green-500/50 rounded-2xl px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="text-left">
                    <div className="text-white font-bold text-sm">Wallet Connected</div>
                    <div className="text-slate-400 text-xs font-mono">{wallet.address?.substring(0, 12)}...{wallet.address?.substring(wallet.address.length - 6)}</div>
                  </div>
                </div>
                <div className="border-l border-slate-600 pl-4">
                  <div className="text-green-400 font-bold text-lg">{wallet.balance} XRP</div>
                </div>
                <button
                  onClick={disconnect}
                  className="ml-2 text-slate-400 hover:text-red-400 transition-colors"
                  title="Disconnect"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Шаги - большие карточки */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            📝 How It Works?
          </h2>
          {!wallet.connected && (
            <p className="text-center text-slate-400 mb-6 text-sm">
              💡 Connect wallet for real transactions or just watch the demo
            </p>
          )}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Шаг 1 */}
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border-2 border-blue-500/30 p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500 flex items-center justify-center text-3xl font-bold text-white">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Lock Funds</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Buyer locks funds in escrow. Seller doesn't receive them yet.
              </p>
            </div>

            {/* Шаг 2 */}
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border-2 border-green-500/30 p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center text-3xl font-bold text-white">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Receive Goods</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Seller ships goods. Buyer checks and confirms delivery.
              </p>
            </div>

            {/* Шаг 3 */}
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border-2 border-purple-500/30 p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500 flex items-center justify-center text-3xl font-bold text-white">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Funds Released</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                All good → funds to seller. Problem → automatic refund to buyer.
              </p>
            </div>
          </div>
        </div>

        {/* Действия - большие понятные кнопки */}
        <div className="space-y-6 mb-12">
          {/* Create Escrow */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <span className="text-3xl">💰</span>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">Step 1: Lock Funds</h2>
                <p className="text-slate-300 text-lg mb-6">
                  Enter amount and lock funds. They'll be safe until goods are delivered.
                </p>
                
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-white font-bold mb-3 text-lg">
                      💵 Amount (XRP)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-900/50 border-2 border-slate-600 rounded-xl text-white text-xl font-bold placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      min="0"
                      step="1"
                      placeholder="10"
                    />
                    <p className="text-slate-400 text-sm mt-2">Example: 10 XRP</p>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-3 text-lg">
                      🔖 Invoice ID
                    </label>
                    <input
                      type="text"
                      value={invoiceId}
                      onChange={(e) => setInvoiceId(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-900/50 border-2 border-slate-600 rounded-xl text-white text-lg font-mono placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      placeholder="INV-..."
                    />
                    <p className="text-slate-400 text-sm mt-2">Auto-generated</p>
                  </div>

                  <div>
                    <label className="block text-white font-bold mb-3 text-lg">
                      ⏰ Delivery Time (seconds)
                    </label>
                    <input
                      type="number"
                      value={refundWindowSeconds}
                      onChange={(e) => setRefundWindowSeconds(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-900/50 border-2 border-slate-600 rounded-xl text-white text-xl font-bold placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      min="1"
                      placeholder="120"
                    />
                    <p className="text-slate-400 text-sm mt-2">120 sec = 2 minutes</p>
                  </div>
                </div>

                <button
                  onClick={handleCreateEscrow}
                  disabled={createLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 disabled:shadow-none transform hover:scale-[1.02] active:scale-[0.98] text-xl"
                >
                  {createLoading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Locking funds...
                    </span>
                  ) : (
                    '🔒 Lock Funds in Escrow'
                  )}
                </button>

                <ResultDisplay result={createResult} />
              </div>
            </div>
          </div>

          {/* Finish Escrow */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                  <span className="text-3xl">✅</span>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">Step 2: Goods Received? Confirm!</h2>
                <p className="text-slate-300 text-lg mb-6">
                  If goods are delivered and everything is fine — click the button. Funds will be sent to seller.
                </p>
                
                <div className="mb-6">
                  <label className="block text-white font-bold mb-3 text-lg">
                    🔢 Escrow Sequence (auto-filled)
                  </label>
                  <input
                    type="number"
                    value={escrowSequence}
                    onChange={(e) => setEscrowSequence(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-900/50 border-2 border-slate-600 rounded-xl text-white text-xl font-mono placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-green-500/50 focus:border-green-500 transition-all"
                    min="1"
                    placeholder="Will be filled after Step 1"
                  />
                  <p className="text-slate-400 text-sm mt-2">
                    {escrowSequence ? '✓ Ready to confirm' : 'Complete Step 1 first'}
                  </p>
                </div>

                <button
                  onClick={handleFinishEscrow}
                  disabled={finishLoading || !escrowSequence}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-green-500/50 disabled:shadow-none transform hover:scale-[1.02] active:scale-[0.98] text-xl"
                >
                  {finishLoading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Releasing funds...
                    </span>
                  ) : (
                    '✅ Goods Received — Release Funds to Seller'
                  )}
                </button>

                <ResultDisplay result={finishResult} />
              </div>
            </div>
          </div>

          {/* Cancel Escrow */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🔄</span>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">Problem? Get Refund</h2>
                <p className="text-slate-300 text-lg mb-6">
                  Goods didn't arrive or something's wrong? Click the button — funds will be returned automatically.
                </p>
                
                <div className="mb-6">
                  <label className="block text-white font-bold mb-3 text-lg">
                    🔢 Escrow Sequence (auto-filled)
                  </label>
                  <input
                    type="number"
                    value={escrowSequence}
                    onChange={(e) => setEscrowSequence(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-900/50 border-2 border-slate-600 rounded-xl text-white text-xl font-mono placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-red-500/50 focus:border-red-500 transition-all"
                    min="1"
                    placeholder="Will be filled after Step 1"
                  />
                  <p className="text-slate-400 text-sm mt-2">
                    {escrowSequence ? '✓ Ready to cancel' : 'Complete Step 1 first'}
                  </p>
                </div>

                <button
                  onClick={handleCancelEscrow}
                  disabled={cancelLoading || !escrowSequence}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-red-500/50 disabled:shadow-none transform hover:scale-[1.02] active:scale-[0.98] text-xl"
                >
                  {cancelLoading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Refunding...
                    </span>
                  ) : (
                    '🔄 Cancel & Refund'
                  )}
                </button>

                <ResultDisplay result={cancelResult} />
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Log */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-2xl">📋</span>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white">Transaction History</h2>
              <p className="text-slate-300">All your actions are recorded on blockchain</p>
            </div>
            {transactionLog.length > 0 && (
              <div className="bg-purple-500/30 border-2 border-purple-400 px-4 py-2 rounded-xl">
                <span className="text-purple-200 font-bold text-lg">{transactionLog.length} transactions</span>
              </div>
            )}
          </div>
          
          {transactionLog.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-700/50 flex items-center justify-center">
                <span className="text-5xl">�</span>
              </div>
              <p className="text-slate-300 font-bold text-xl mb-2">Empty for now</p>
              <p className="text-slate-400 text-lg">Complete Step 1 to start</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactionLog.map((log, index) => (
                <div
                  key={log.id}
                  className={`p-6 rounded-2xl border-2 backdrop-blur-sm transition-all hover:scale-[1.01] ${
                    log.status === 'success'
                      ? 'bg-green-500/10 border-green-500/40'
                      : 'bg-red-500/10 border-red-500/40'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold ${
                        log.action === 'create' ? 'bg-blue-500/30 text-blue-300' :
                        log.action === 'finish' ? 'bg-green-500/30 text-green-300' :
                        'bg-red-500/30 text-red-300'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-4 py-2 rounded-xl text-sm font-bold uppercase ${
                          log.action === 'create' ? 'bg-blue-500 text-white' :
                          log.action === 'finish' ? 'bg-green-500 text-white' :
                          'bg-red-500 text-white'
                        }`}>
                          {log.action === 'create' ? '💰 LOCKED' : 
                           log.action === 'finish' ? '✅ RELEASED' : 
                           '🔄 REFUNDED'}
                        </span>
                        <span className="text-slate-400 text-sm font-mono">
                          {log.timestamp.toLocaleTimeString('en-US')}
                        </span>
                        {log.status === 'success' ? (
                          <span className="ml-auto bg-green-500/20 text-green-300 px-3 py-1 rounded-lg text-sm font-bold">
                            ✓ Success
                          </span>
                        ) : (
                          <span className="ml-auto bg-red-500/20 text-red-300 px-3 py-1 rounded-lg text-sm font-bold">
                            ✗ Error
                          </span>
                        )}
                      </div>
                      {log.error && (
                        <div className="text-red-300 text-sm mb-2 font-medium bg-red-900/20 p-3 rounded-lg">
                          {log.error}
                        </div>
                      )}
                      {log.txHash && (
                        <div className="flex items-center gap-2 flex-wrap mt-3">
                          <code className="text-xs bg-slate-900/70 text-slate-300 px-3 py-2 rounded-lg font-mono border border-slate-700">
                            {log.txHash.substring(0, 32)}...
                          </code>
                          {log.explorerUrl && (
                            <a
                              href={log.explorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition-all"
                            >
                              🔍 View on Blockchain
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          {isDemoMode && (
            <div className="mb-4 inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/50 backdrop-blur-sm px-6 py-3 rounded-full">
              <span className="text-2xl">🎭</span>
              <span className="text-yellow-300 font-semibold">Demo mode (backend not connected)</span>
            </div>
          )}
          <div className="inline-flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-700">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-slate-300 font-semibold">Connected to XRPL Testnet</span>
          </div>
          <p className="text-slate-400 mt-4 text-sm">
            All transactions are recorded on blockchain and cannot be modified
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
