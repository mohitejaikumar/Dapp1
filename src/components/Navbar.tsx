import {
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import RaydiumSvg from './RaydiumSvg';
import { useNavigate } from 'react-router';





export default function Navbar(){
    const navigate = useNavigate();
    return (
        <div className="nav">
            <div className="nav-part-1">
                <RaydiumSvg />
                <div className="nav-part-1-tabs">
                    <h1 onClick={()=>{navigate('/')}}>Swap</h1>
                    <h1>Liquidity</h1>
                    <h1 onClick={()=>{navigate('/launchPad')}}>LaunchPad</h1>
                    <h1>More</h1>
                </div>
            </div>
            <div className="nav-part-2">
                <h1 className="priority">Priority: <span className="turbo">Turbo</span></h1>
                <WalletMultiButton />
            </div>
        </div>
    )
}