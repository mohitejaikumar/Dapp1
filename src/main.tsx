
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router'
import WalletAdapter from './providers/WalletAdapter.tsx'

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <WalletAdapter>
            <App />
        </WalletAdapter>
    </BrowserRouter>
)
