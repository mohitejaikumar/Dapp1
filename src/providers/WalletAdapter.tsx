
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import React from 'react'
import '@solana/wallet-adapter-react-ui/styles.css';


const WalletAdapter = ({children}:{
    children: React.ReactNode
}) => {

    return (
        <>
        <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
                <WalletProvider wallets={[]} autoConnect>
                    <WalletModalProvider>
                        {children}
                    </WalletModalProvider>
                </WalletProvider>
            </ConnectionProvider>
        </>
    )
}

export default WalletAdapter

