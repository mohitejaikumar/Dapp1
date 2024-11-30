import { Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useState } from "react";
import {createAssociatedTokenAccountInstruction, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, createMintToInstruction, ExtensionType, getAssociatedTokenAddressSync, 
getMintLen,LENGTH_SIZE, TOKEN_2022_PROGRAM_ID,  TYPE_SIZE} from "@solana/spl-token";
import {createInitializeInstruction, pack} from "@solana/spl-token-metadata";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { pinata } from "../utils/config";

const LaunchPad = ()=>{

    const [mintAddress, setMintAddress] = useState<string>("");
    const [amount, setAmount] = useState<number>(0);
    const {connection} = useConnection();
    const wallet = useWallet();
    const [error , setError] = useState<string>("");
    const [address, setAddress] = useState<string>("");


    const handleSubmit = (e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        // Use FormData to get form field values
        const formData = new FormData(e.target as HTMLFormElement);
        const formValues = Object.fromEntries(formData.entries());

        console.log("Form Values:", formValues);
        createToken(
            formValues.name as string,
            formValues.symbol as string,
            formValues.description as string,
            formValues.imageURL as string
        );
    }
    
    

    const createToken = async(name:string, symbol:string, description:string, imageURL:string)=>{
        console.log("create token");
        // first create mint 
        // add metadata to it 
        // sign transaction 
        // send transaction 
        try{
            const mintKeypair = Keypair.generate();
            // Convert JSON object to a string
            const jsonString = {
                name: name!,
                symbol: symbol!,
                description: description!,
                image: imageURL!,
            };
            console.log(jsonString);
            const response = await pinata.upload.json(jsonString,{
                groupId:'01937f02-6624-76ea-b624-e71510cecfa2'
            });
            const metadata = {
                mint: mintKeypair.publicKey,
                name:name!,
                symbol:symbol!,
                uri:`https://${import.meta.env.VITE_GATEWAY}/files/${response.cid}`,
                additionalMetadata:[]
            }
            const mintLen = getMintLen([ExtensionType.MetadataPointer]);
            const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
            const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);
            console.log("lamports", lamports);
            // transaction 
            // 1. create mint account
            // 2. createInitializeMetadataPointer
            // 3. createInitializeMint
            // 4. createIntializeInstruction
            const transaction = new Transaction().add(
                SystemProgram.createAccount({
                    fromPubkey: wallet.publicKey!,
                    newAccountPubkey: mintKeypair.publicKey,
                    lamports,
                    space: mintLen,
                    programId: TOKEN_2022_PROGRAM_ID,
                }),
                createInitializeMetadataPointerInstruction(
                    mintKeypair.publicKey,
                    wallet.publicKey!,
                    mintKeypair.publicKey,
                    TOKEN_2022_PROGRAM_ID
                ),
                createInitializeMintInstruction(
                    mintKeypair.publicKey,
                    9,
                    wallet.publicKey!,
                    wallet.publicKey!,
                    TOKEN_2022_PROGRAM_ID
                ),
                createInitializeInstruction({
                    programId: TOKEN_2022_PROGRAM_ID,
                    mint: mintKeypair.publicKey,
                    mintAuthority: wallet.publicKey!,   
                    updateAuthority: wallet.publicKey!,
                    metadata: mintKeypair.publicKey,
                    name:metadata.name,
                    symbol:metadata.symbol,
                    uri:metadata.uri,
                })
            )

            transaction.feePayer = wallet.publicKey!;
            transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            transaction.partialSign(mintKeypair);

            await wallet.sendTransaction(transaction,connection);
            console.log(`Token mint created at ${mintKeypair.publicKey.toBase58()}`);
            setAddress(mintKeypair.publicKey.toBase58());
            setError("");
        }
        catch(e){
            setError(JSON.stringify(e));
            setAddress("");
        } 
        
    }

    const mintToken = async()=>{
        // getOrCreateAssociatedTokenAccount
        // send Transaction 
        // mint token 
        // send Transaction
        
        // pda
        try{
            const associatedPublicKey = getAssociatedTokenAddressSync(
                new PublicKey(mintAddress),
                wallet.publicKey!,
                false,
                TOKEN_2022_PROGRAM_ID
            )
            console.log("associatedKeypair", associatedPublicKey.toBase58());

            const transaction = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    wallet.publicKey!,
                    associatedPublicKey,
                    wallet.publicKey!,
                    new PublicKey(mintAddress),
                    TOKEN_2022_PROGRAM_ID
                )
            )

            await wallet.sendTransaction(transaction,connection);
            console.log(`Token Account created at ${associatedPublicKey.toBase58()}`);

            const transaction2 = new Transaction().add(
                createMintToInstruction(
                    new PublicKey(mintAddress),
                    associatedPublicKey,
                    wallet.publicKey!,
                    amount,
                    [],
                    TOKEN_2022_PROGRAM_ID
                )
            )

            await wallet.sendTransaction(transaction2,connection);
            console.log(`Token Minted to ${associatedPublicKey.toBase58()}`);
            setAddress(associatedPublicKey.toBase58());
            setError("");
        }
        catch(e){
            setError(JSON.stringify(e));
            setAddress("");
        }
        
    }

    const handleMintSubmit = (e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        // Use FormData to get form field values
        const formData = new FormData(e.target as HTMLFormElement);
        const formValues = Object.fromEntries(formData.entries());
        console.log("Form Values:", formValues);
        setMintAddress(formValues.mintAddress as string);
        setAmount(Number(formValues.amount as string));
        mintToken();
    }



    return (
        <div style={{height:"88vh",width:'100%',display:"flex", flexDirection:'column',justifyContent:"center", alignItems:"center"}}>
        <div style={{ width:'100%',display:"flex", justifyContent:"space-around", alignItems:"center"}}>
            <form onSubmit={handleSubmit} style={{width:'30%' , display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', gap:'1vw'}}>
                
                <div>Create Token</div>
                <input type="text" name="name" placeholder="Token Name" style={{width:'100%', height:'40px' , padding:'0 1vw'}} />
            
                <input type="text" name="symbol" placeholder="Token Symbol" style={{width:'100%', height:'40px',padding:'0 1vw'}}/>
                                
                <input type="text" name="description" placeholder="Token Description" style={{width:'100%', height:'40px',padding:'0 1vw'}}/>
                            
                <input type="text" name="imageURL" placeholder="Token Image URL" style={{width:'100%', height:'40px',padding:'0 1vw'}}/>
                            
                <button type="submit" style={{width:'30%', height:'40px' ,display:'flex', justifyContent:'center', alignItems:'center' , cursor:'pointer'}}>Create Token</button>
            </form>
            <form onSubmit={handleMintSubmit} style={{width:'30%' , display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center' , gap:'1vw'}}>
                <div>Mint Token</div>
                <input type="text" name="mintAddress" placeholder="Mint Address" style={{width:'100%', height:'40px' , padding:'0 1vw'}} />
            
                <input type="text" name="amount" placeholder="Amount (Lamports)" style={{width:'100%', height:'40px',padding:'0 1vw'}}/>
                <button type="submit" style={{width:'30%', height:'40px' ,display:'flex', justifyContent:'center', alignItems:'center' , cursor:'pointer'}}>Mint Token</button> 
            </form>
            </div>
            { error.length>0 &&
                <div style={{color:'red' , marginTop:'2vw'}}>
                    {error}
                </div>
            }
            { address.length>0 &&
                <div style={{color:'green' , marginTop:'2vw'}}>
                    Address:   {address}
                </div>
            }
        </div>
    )
}

export default LaunchPad;