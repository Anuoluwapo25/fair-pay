import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useActiveAccount, useActiveWallet, useDisconnect } from "thirdweb/react";
import { useGoogleSmartAccount, usePasskeySmartAccount } from "../hooks/useSmartAccount";
import { Wallet } from "thirdweb/wallets";

interface AuthContextType {
  isConnected: boolean;
  address: string | undefined;
  connectWithGoogle: () => Promise<void>;
  connectWithPasskey: () => Promise<void>;
  disconnect: () => void;
  wallet: Wallet | undefined
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const account = useActiveAccount();
  const wallet = useActiveWallet(); 
  const { disconnect: disconnectWallet } = useDisconnect(); 

  const { connectWithGoogle: rawConnectWithGoogle } = useGoogleSmartAccount();
  const { connectWithPasskey: rawConnectWithPasskey } = usePasskeySmartAccount();
  const [isConnected, setIsConnected] = useState(false);

  const connectWithGoogle = async () => {
    await rawConnectWithGoogle();
  };

  const connectWithPasskey = async () => {
    await rawConnectWithPasskey();
  };

  useEffect(() => {
    setIsConnected(!!account?.address);
  }, [account]);

  const disconnect = () => {
    if (wallet) disconnectWallet(wallet);
  };

  return (
    <AuthContext.Provider
      value={{
        isConnected,
        address: account?.address,
        connectWithGoogle,
        connectWithPasskey,
        disconnect,
        wallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
