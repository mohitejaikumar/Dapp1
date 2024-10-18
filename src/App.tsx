import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';
import './App.css'
import { useMemo } from 'react';
import Swap from './components/Swap';
import Navbar from './components/Navbar';

function App() {

      // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);


  return (
    <>
      <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={[]} autoConnect>
                <WalletModalProvider>
                    <Navbar />
                    <Swap/>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    </>
  )
}

export default App
