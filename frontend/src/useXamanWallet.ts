// Простой хук для подключения Xaman кошелька
import { useState } from 'react';

interface WalletState {
  connected: boolean;
  address: string | null;
  balance: string | null;
}

export function useXamanWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    balance: null,
  });
  const [connecting, setConnecting] = useState(false);

  const connect = async () => {
    setConnecting(true);
    try {
      // Для демо - симулируем подключение
      // В реальности здесь будет XUMM SDK
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Демо адрес
      const demoAddress = 'rDemo1234567890ABCDEFGHabcdefgh';
      const demoBalance = '1,234.56';
      
      setWallet({
        connected: true,
        address: demoAddress,
        balance: demoBalance,
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    setWallet({
      connected: false,
      address: null,
      balance: null,
    });
  };

  return {
    wallet,
    connecting,
    connect,
    disconnect,
  };
}
