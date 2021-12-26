import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Keypair, SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useState, useEffect, useCallback } from 'react'

import type { NextPage } from 'next'

const Home: NextPage = () => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [message, setMessage] = useState("")
  const [transactionSignature, setTransactionSignature] = useState("")

  const img = "https://cdn.publish0x.com/prod/fs/images/367f59c20e8257c5b8cc9943a8a5fa1c9f977cac02e39268afa9c1d11b465c2d.jpg"

  const sendSol = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();

    const receiverPublicKey = new PublicKey("PUzY4tia8yVhmgYqUNt7AT1ZxwnCMJfjoyaPqpfDhrx")
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: receiverPublicKey,
        lamports: LAMPORTS_PER_SOL,
      })
    )

    transaction.feePayer = await publicKey;
    let blockhashObj = await connection.getRecentBlockhash();
    transaction.recentBlockhash = await blockhashObj.blockhash;

    const signature = await sendTransaction(transaction, connection)
    setTransactionSignature(signature)
    await connection.confirmTransaction(signature, 'processed')
    
    setMessage(`1 SOL transfered to ${receiverPublicKey.toString()}`)
  }, [publicKey, sendTransaction, connection])

  const airdropSol = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();

    var airdropSignature = await connection.requestAirdrop(
      publicKey,
      LAMPORTS_PER_SOL
    )

    await connection.confirmTransaction(airdropSignature);
    setMessage(`1 SOL successfuly airdroped to your wallet`)
  }, [publicKey, connection])


  return (
    <div className='flex flex-col items-center justify-end w-full h-screen min-h-screen pb-16 space-y-20'
    style={{
      backgroundSize: "cover",
      backgroundAttachment: "fixed",
      backgroundImage: `url(${img})`,
    }}>
      <div className='flex items-center justify-center space-x-4'>
        <WalletMultiButton />
        <button onClick={sendSol} disabled={!publicKey} className='px-6 py-3 font-bold text-white bg-red-400 rounded disabled:opacity-40 hover:opacity-75'>
          Send 1 SOL
        </button>

        <button onClick={airdropSol} disabled={!publicKey} className='px-6 py-3 font-bold text-white bg-green-600 rounded disabled:opacity-40 hover:opacity-75'>
          Airdrop 1 SOL
        </button>
      </div>
      
      { message && 
        <div className='px-4 py-2 text-xs font-bold text-center text-white bg-purple-400 rounded'>
          {message} {transactionSignature && <a href={`https://solscan.io/tx/${transactionSignature}?cluster=devnet`} target="blank">- [Solscan]</a>}
        </div> }
    </div>
  )
}

export default Home
