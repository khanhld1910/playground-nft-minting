import React, { useState, useEffect, useRef } from 'react'
import { ethers } from 'ethers'

import abi from './utils/WavePortal.json'
import './App.css'

export default function App() {
  /*
   * Just a state variable we use to store our user's public wallet.
   */
  const [currentAccount, setCurrentAccount] = useState('')
  /*
   * All state property to store all waves
   */
  const [allWaves, setAllWaves] = useState([])
  const contractAddress = '0x825154Ab5B553B382b8D2a0bb47ee5a387F4a288'
  /**
   * Create a variable here that references the abi content!
   */
  const contractABI = abi.abi

  const checkIfWalletIsConnected = async () => {
    let isConnected
    try {
      const { ethereum } = window

      if (!ethereum) {
        console.log('Make sure you have metamask!')
        return
      } else {
        console.log('We have the ethereum object', ethereum)
      }

      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: 'eth_accounts' })

      if (accounts.length !== 0) {
        const account = accounts[0]
        console.log('Found an authorized account:', account)
        setCurrentAccount(account)
        isConnected = true
      } else {
        console.log('No authorized account found')
        isConnected = false
      }
    } catch (error) {
      console.log(error)
      isConnected = true
    }
    return isConnected
  }

  /**
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        alert('Get MetaMask!')
        return
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

      console.log('Connected', accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  const inputRef = useRef()

  const [isWaving, setIsWaving] = useState(false)
  const wave = async () => {
    setIsWaving(true)
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        // read the wave count from smart contract
        let count = await wavePortalContract.getTotalWaves()
        console.log('Retrieved total wave count...', count.toNumber())

        /*
         * Execute the actual wave from your smart contract
         */
        const message = inputRef?.current?.value || ''
        const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 })
        console.log('Mining...', waveTxn.hash)

        await waveTxn.wait()
        console.log('Mined -- ', waveTxn.hash)

        count = await wavePortalContract.getTotalWaves()
        console.log('Retrieved total wave count...', count.toNumber())
        // clear the input
        if (inputRef?.current) {
          inputRef.current.value = ''
        }
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsWaving(false)
    }
  }

  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves()

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = []
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          })
        })

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned)
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * Listen in for emitter events!
   */
  useEffect(() => {
    let wavePortalContract

    const onNewWave = (from, timestamp, message) => {
      console.log('NewWave', from, timestamp, message)
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message
        }
      ])
    }

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()

      wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      )
      wavePortalContract.on('NewWave', onNewWave)
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off('NewWave', onNewWave)
      }
    }
  }, [])

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    checkIfWalletIsConnected().then(isConnected => {
      if (isConnected) {
        getAllWaves()
      }
    })
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">👋 Hey there!</div>

        <div className="bio">
          It's Sunny Stag learns to create a smart contract =D <br />
          Connect your Ethereum wallet and wave at me!
        </div>
        <input
          type="text"
          ref={inputRef}
          style={{ marginTop: 50, height: '1.5rem' }}
          placeholder="Send me a message"
        />
        <button className="waveButton" onClick={wave} disabled={isWaving}>
          {isWaving ? 'Waving...' : 'Wave at Me'}
        </button>

        {/*
         * If there is no currentAccount render this button
         */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        <div
          className="descending-wave-list-by-time"
          style={{
            display: 'flex',
            flexDirection: 'column-reverse',
            padding: 5,
            border: '1px solid #222',
            marginTop: 20,
          }}
        >
          {allWaves.map((wave, index) => {
            return (
              <div
                key={index}
                style={{
                  backgroundColor: 'OldLace',
                  marginTop: '16px',
                  padding: '8px'
                }}
              >
                <div>Address: {wave.address}</div>
                <div>Time: {wave.timestamp.toString()}</div>
                <div>Message: {wave.message}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
