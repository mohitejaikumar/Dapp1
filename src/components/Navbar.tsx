import {
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import RaydiumSvg from './RaydiumSvg';





export default function Navbar(){
    return (
        <div className="nav">
            <div className="nav-part-1">
                <RaydiumSvg />
                <div className="nav-part-1-tabs">
                    <h1>Swap</h1>
                    <h1>Liquidity</h1>
                    <h1>Portfolio</h1>
                    <h1>More</h1>
                </div>
            </div>
            <div className="nav-part-2">
                <h1>Priority: <span className="turbo">Turbo</span></h1>
                <WalletMultiButton />
            </div>
        </div>
    )
}