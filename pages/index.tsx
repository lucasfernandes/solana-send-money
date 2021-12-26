import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Keypair, SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useState, useEffect, useCallback } from 'react'

import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'


const Home: NextPage = () => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [message, setMessage] = useState("")
  const [transactionSignature, setTransactionSignature] = useState("")

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
    <div className='flex flex-col items-center justify-center min-h-screen space-y-10 bg-gray-800'>
      <div className='flex items-center justify-center space-x-2'>
        <WalletMultiButton />
        <button onClick={sendSol} disabled={!publicKey} className='px-6 py-3 font-bold text-white bg-red-400 rounded disabled:opacity-40 hover:opacity-75'>
          Send 1 SOL
        </button>

        <button onClick={airdropSol} disabled={!publicKey} className='px-6 py-3 font-bold text-white bg-green-600 rounded disabled:opacity-40 hover:opacity-75'>
          Airdrop 1 SOL
        </button>
      </div>
      
      { message && 
        <div className='px-4 py-2 text-xs font-bold text-center text-white bg-green-400 rounded'>
          {message} {transactionSignature && <a href={`https://solscan.io/tx/${transactionSignature}?cluster=devnet`} target="blank">- [Solscan]</a>}
        </div> }
    </div>
  )
}

export default Home
