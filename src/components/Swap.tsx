import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import axios from 'axios';
import { ArrowDown, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { VersionedTransaction } from '@solana/web3.js';
import { Buffer } from 'buffer'; // Using the buffer polyfill

interface TokenInfo {
    address: string;
    created_at: string;
    daily_volume: number;
    decimals: number;
    extensions: {
        coingeckoId: string;
    };
    freeze_authority: string | null;
    logoURI: string;
    mint_authority: string | null;
    minted_at: string | null;
    permanent_delegate: string | null;
    symbol: string;
    tags: string[];
}


gsap.registerPlugin(useGSAP);

export default function Swap(){

    const [sellToken , setSellToken] = useState<TokenInfo>();
    const [buyToken, setBuyToken] = useState<TokenInfo>();
    const [sellAmount, setSellAmount] = useState<number>();
    const [quoteAmount, setQuoteAmount] = useState<number>();
    const [threshold, setThreshold] = useState<number>();
    const [isLoading, setLoading] = useState<boolean>(false);
    const [, setAvailableTokens] = useState<TokenInfo[]>([]);
    const {connection} = useConnection();
    const wallet = useWallet();
    const sellRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const container = useRef();
    const infoRef = useRef<HTMLDivElement>(null);
    const [quoteResponse, setQuoteResponse] = useState();
    const isThisFirstTime = useRef<boolean>(false);

    useEffect(()=>{
        async function getAllTokens(){
            const response  = await axios.get('https://tokens.jup.ag/tokens?tags=verified');
            setAvailableTokens(response.data);
            setBuyToken(response.data[0]);
            setSellToken(response.data[1]);
        }
        getAllTokens();
    },[])

    useEffect(()=>{
        if(wallet.publicKey){
            console.log(wallet.publicKey, wallet.publicKey.toBase58());
        }
    },[wallet])



    useEffect(()=>{
        if(sellRef.current && inputRef.current && sellAmount){
            if(sellAmount > 0){
                sellRef.current.style.border = "2px solid #5B3997";
                sellRef.current.style.boxShadow = "0 0 15px 5px rgba(91, 57, 151, 0.5)";
            }
        }
    },[sellAmount])


    useGSAP(()=>{
        if(sellAmount && sellAmount>0 && quoteAmount && !isThisFirstTime.current){
            gsap.fromTo(infoRef.current,{
                opacity:0,
                y:-100,
                duration:0.5,
            },{
                display:'block',
                y:0,
                opacity:1,
            })
            console.log("displaying info");
            isThisFirstTime.current = true;
        }
        if(!sellAmount || sellAmount==0){
            gsap.to(infoRef.current,{
                opacity:0,
                display:'none'
            })
            console.log("hiding info");
            isThisFirstTime.current = false;
        }
        console.log("hi value changed");
        
    },{dependencies:[sellAmount , quoteAmount],scope:container})




    async function handleInput(e:React.ChangeEvent<HTMLInputElement>){
        e.target.value = e.target.value.replace(/[^0-9.]/g, '');
        // Ensure that only one decimal point is allowed
        if (e.target.value.split('.').length > 2) {
        e.target.value = e.target.value.slice(0, -1); // Remove extra decimal point
        }
        setSellAmount(Number(e.target.value));
        console.log("hi from  handlechange ")
        
        
        async function getQuote(){
            if(sellToken && buyToken){
                setLoading(true);
                const response = await axios.get(`
                https://quote-api.jup.ag/v6/quote?inputMint=${sellToken.address}&outputMint=${buyToken?.address}&amount=${Number(e.target.value)*Math.pow(10,sellToken.decimals)}&slippageBps=50`);

                if(Number(e.target.value)> 0){
                    setQuoteResponse(response.data);
                    setQuoteAmount(Number(response.data.outAmount)/Math.pow(10,buyToken.decimals));
                    setThreshold(Number(response.data.otherAmountThreshold)/Math.pow(10,buyToken.decimals));
                }
                setLoading(false);
            }
        }
        
        const interval = setInterval(()=>{
            if(!sellToken || !buyToken ||(Number(e.target.value)==0)){
                clearInterval(interval);
                return;
            }
            else{
                getQuote();
            }
        },3000);
    }

    async function onSubmit(){
        if(!wallet.publicKey) return;
        const { swapTransaction } = await (
            await fetch('https://quote-api.jup.ag/v6/swap', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                // quoteResponse from /quote api
                quoteResponse,
                // user public key to be used for the swap
                userPublicKey: wallet.publicKey.toString(),
                // auto wrap and unwrap SOL. default is true
                wrapAndUnwrapSol: true,
                // feeAccount is optional. Use if you want to charge a fee.  feeBps must have been passed in /quote API.
                // feeAccount: "fee_account_public_key"
                })
            })
        ).json();
        console.log(swapTransaction);
        const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
        const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
        console.log(transaction);
        //@ts-ignore
        await wallet.signTransaction(transaction);

        // get the latest block hash
        const latestBlockHash = await connection.getLatestBlockhash();
        // Execute the transaction
        const rawTransaction = transaction.serialize()
        const txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 2
        });

        await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: txid
        });
        console.log(`https://solscan.io/tx/${txid}`);
    }



    return (
        <div className="swap-page">
            <div className="swap-component">
                <div ref={sellRef} className="from-div">
                    <div>
                        <h1>From</h1>
                    </div>
                    <div className="swap-div">
                        <div className="token">
                            <img alt={sellToken?.symbol} src={sellToken?.logoURI} loading="lazy" className="chakra"></img>
                            <h1>{sellToken?.symbol}</h1>
                            <ChevronDown />
                        </div>
                        <input 
                            ref={inputRef} 
                            type="number" 
                            className="input-field" 
                            onChange={handleInput} 
                            value={sellAmount} 
                            placeholder="0.0"
                        />
                    </div>
                    <div className="swap-arrow">
                        <div className="swap-arrow-icon1">
                            <ArrowDown  />
                        </div>
                    </div>
                </div>
                <div className="to-div">
                    <div>
                        <h1>To</h1>
                    </div>
                    <div className="swap-div">
                        <div className="token">
                            <img alt={buyToken?.symbol} src={buyToken?.logoURI} loading="lazy" className="chakra"></img>
                            <h1>{buyToken?.symbol}</h1>
                            <ChevronDown />
                        </div>
                        <div className="quote">
                        {JSON.stringify(quoteAmount)}
                        </div>
                    </div>
                    
                </div>
                <div ref={infoRef} className="info">
                    <h1 className="peg">{sellAmount && `1 ${sellToken?.symbol} ≈  ${Number(quoteAmount)/sellAmount} ${buyToken?.symbol}`}</h1>
                    <div className="min-threshold">
                        <h1>Minimum Received</h1>
                        <h2>{`${threshold} ${buyToken?.symbol}`}</h2>
                    </div>
                </div>
                { wallet.connected ? 
                    <button className="submit-btn" disabled={isLoading} onClick={onSubmit}>
                        {(isLoading?'':'Submit')}
                        {isLoading && <span className="loader"></span>}
                    </button>
                :
                    <WalletMultiButton />
                }
            </div>
        </div>
    )
}