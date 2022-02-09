import React, { useState, useEffect, useRef } from 'react'
import './App.css'

import { ethers, utils } from 'ethers'

import abi from './utils/MyContractABI.json'

const CONTRACT_ADDRESS = '0xE5e2E87E65e594E1deF0ffaA23F1750288cD43d0'

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('')

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

  const [total, setTotal] = useState('')
  const [target, setTarget] = useState('')


  const contractABI = abi.abi

  const inputRef = useRef()

  const [isSending, setIsSending] = useState(false)
  const [txnHash, setTxnHash] = useState()
  
  const fund = async () => {
    setIsSending(true)
    setTxnHash(null)
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const MyFundingContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractABI,
          signer
        )

        let total = await MyFundingContract.total()
        console.log('Retrieved total funding...', total.toString())
        
        const value = inputRef?.current?.value || ''
        console.log('Fund:', utils.parseEther(value).toString())
        const fundTxn = await MyFundingContract.fund({
          gasLimit: 300000,
          value: utils.parseEther(value).toString(),
        })

        console.log('Funding...', fundTxn.hash)
        setTxnHash(fundTxn.hash)

        await fundTxn.wait()
        console.log('Funded -- ', fundTxn.hash)

        total = await MyFundingContract.total()
        console.log('Retrieved total funding...', total.toString())
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
      setIsSending(false)
    }
  }

  const getTotal = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const MyFundingContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractABI,
          signer
        )
        const totalBignumber = await MyFundingContract.total()
        setTotal(utils.formatEther(totalBignumber))
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getTarget = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const MyFundingContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractABI,
          signer
        )
        const targetBignumber = await MyFundingContract.target()
        setTarget(utils.formatEther(targetBignumber))
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }
  

  useEffect(() => {
    let MyFundingContract

    const onFund = (from, timestamp, message) => {
      console.log('Funding...', from, timestamp, message)
      getTotal()
    }

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()

      MyFundingContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        signer
      )
      getTarget()    
      MyFundingContract.on('Fund', onFund)
    }

    return () => {
      if (MyFundingContract) {
        MyFundingContract.off('Fund', onFund)
      }
    }
  }, [])
  

  useEffect(() => {
    checkIfWalletIsConnected().then(isConnected => {
      if (isConnected) {
        getTotal()
        // getTarget()
      }
    })
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">👋 Hey there!</div>

        <div className="bio">
          It's Sunny Stag learns to create a smart contract =D <br />
          Connect your Ethereum wallet and wave at me! <br />
          (Rinkeby Testnet) <br />
          go{' '}
          <a href="https://faucets.chain.link/rinkeby" target="_blank">
            here
          </a>{' '}
          to request some ETH to test
        </div>

        <div className="header">Funding progress: {total}/{target} ETH 😍😍😍</div>
        <input
          type="text"
          ref={inputRef}
          style={{ marginTop: 50, height: '1.5rem' }}
          placeholder="send me Eth 🤑 "
        />
        <button className="waveButton" onClick={fund} disabled={isSending}>
          {isSending ? '😍😍😍 sending...' : 'Send me some Eth 🤑'}
        </button>
        <div className="status">
          {txnHash && (
            <div>
              recent transaction hash:{' '}
              <a
                href={`https://rinkeby.etherscan.io/tx/${txnHash}`}
                target="_blank"
              >
                {txnHash}
              </a>
            </div>
          )}
        </div>

        {/*
         * If there is no currentAccount render this button
         */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

      </div>
    </div>
  )
}
export default App
