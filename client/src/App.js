import React, { useState, useEffect, useRef, useMemo } from 'react'
import { ethers } from 'ethers'
import axios from 'axios'
import abi from './utils/CohartABI.json'
import './App.css'

import { create } from 'ipfs-http-client'
const client = create('https://ipfs.infura.io:5001/api/v0')

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

export default function App() {
  /*
   * Just a state variable we use to store our user's public wallet.
   */
  const [currentAccount, setCurrentAccount] = useState('')
  
  const contractAddress = '0x970417AcE3E0d8CEA682900E8138D346B205fF75'
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

  const [isMinting, setIsMinting] = useState(false)
  const mintNFT = async ({
    metadataURI,
    artworkName,
    tags,
    shares,
  }) => {
    setIsMinting(true)
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const myPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )
        
        // console.log({
        //   metadataURI,
        //   artworkName,
        //   tags,
        //   shares,
        // })
        

        const mintingTxn = await myPortalContract.safeMint(
          currentAccount,// address to,
          metadataURI, // string memory uri,
          artworkName, //string memory name,
          tags, // string[] memory tags,
          shares, // Share[] memory shares,
        )
        console.log('Mining...', mintingTxn.hash)

        await mintingTxn.wait()
        console.log('Mined -- ', mintingTxn.hash)
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsMinting(false)
    }
  }

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    checkIfWalletIsConnected().then(isConnected => {
      // TODO: do st here?
    })
  }, [])

  const [fileUrl, updateFileUrl] = useState(``)
  
  async function uploadFileToIPFs(file) {
    // const url = URL.createObjectURL(file);
    // updateFileUrl(url)
    try {
      const added = await client.add(file)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      updateFileUrl(url)
      return url
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }

  async function uploadMetadataToIPFS(metadata) {
    const metadataBlob = new Blob([[JSON.stringify(metadata)]], {
      type: 'text/plain'
    })
    try {
      const added = await client.add(metadataBlob)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      return url
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }

  const [formData, setFormData] = useState({
    addressA: '0x72F8a330Ae8024A84b5BEc8F75c7931cA71BCf10',
    addressB: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4'
  })

  const collections = useMemo(() => {
    return [
      { name: 'Collection A' },
      { name: 'Collection B' },
      { name: 'Collection C' }
    ]
  }, [])

  const handleChange = e => {
    const { name, value, files } = e.target
    setFormData(data => ({
      ...data,
      [name]: name === 'file' ? files[0] : value
    }))
  }

  const handleImageChange = async e => {
    const file = e.target.files[0]
    const fileUrl = await uploadFileToIPFs(file)
    setFormData(data => ({
      ...data,
      fileUrl
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()

    const tags = (formData?.tags || '').split(',').map(i => i.trim())

    const metadata = {
      description: formData?.description,
      external_url: formData?.fileUrl, // TODO: ???
      image: formData?.fileUrl,
      name: formData?.artworkName,
      attributes: [
        // {
        //   trait_type: 'base',
        //   value: 'narwhal'
        // },
        // {
        //   trait_type: 'eyes',
        //   value: 'sleepy'
        // },
        // {
        //   trait_type: 'mouth',
        //   value: 'cute'
        // },
        // {
        //   trait_type: 'level',
        //   value: 4
        // },
        // {
        //   trait_type: 'stamina',
        //   value: 90.2
        // },
        // {
        //   trait_type: 'personality',
        //   value: 'boring'
        // },
        ...tags.map(tag => ({ trait_type: 'Tag', value: tag })),
        {
          display_type: 'number',
          trait_type: 'price',
          value: Number(formData?.price || 0)
        }
      ],
      // background_color,
      // animation_url,
      // youtube_url,
    }
    const metadataURI = await uploadMetadataToIPFS(metadata)
    
    const a = await mintNFT({
      artworkName: formData?.artworkName,
      metadataURI,
      shares: [
        // TODO: the cohart share account should be handled inside contract
        { to: contractAddress, name: 'Cohart', percentage: 10 },
        { to: currentAccount, name: 'artist', percentage: Number(formData?.shareOwner || 0) },
        { to: formData?.addressA || null, name: 'sharePersonA', percentage: Number(formData?.shareA || 0) },
        { to: formData?.addressB || null, name: 'sharePersonA', percentage: Number(formData?.shareB || 0) },
      ],
      tags,
    })

    console.log({a})

    // TODO: pin to Pinata these 2 files ???
    // body.fileUrl, and metadataURL
  }

  const [selectedTokenId, setTokenId] = useState(3)
  const [selectedToken, setSelectedToken] = useState()
  const handleViewDetails = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const myPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )
        console.log({selectedTokenId})

        const [
          tokenURI,
          _shares,
        ] = await Promise.all([
          myPortalContract.tokenURI(selectedTokenId),
          myPortalContract.getShares(selectedTokenId),
        ])

        const { data } = await axios.get(tokenURI)
        console.log(JSON.stringify(data, null, 2))

        const { description, image, name, attributes } = data

        const shares = (_shares || []).filter(({ to }) => to !== NULL_ADDRESS)

        setSelectedToken({
          description,
          image,
          name,
          attributes,
          shares,
          tokenURI,
        })
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    } finally {
      // 
    }
  }

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">👋 Hey there!</div>

        <div className="bio">
          It's Sunny Stag learns to create a smart contract =D <br />
          go{' '}
          <a href="https://faucets.chain.link/rinkeby" target="_blank">
            here
          </a>{' '}
          to request some ETH to test (on Rinkeby Testnet)
        </div>

        <form onSubmit={handleSubmit}>
          <div className="split-container">
            <div className="artwork-form">
              <div className="form-field">
                <label>Artwork name</label>
                <input
                  type="text"
                  placeholder="artwork name"
                  name="artworkName"
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label>Artwork description</label>
                <textarea
                  name="description"
                  placeholder="artwork description"
                  onChange={handleChange}
                />
              </div>
              {fileUrl && (
                <div className="img-preview">
                  <img src={fileUrl} width="100%" />
                </div>
              )}
              <div className="form-field">
                <label>Artwork file (image, video, ...)</label>
                <input
                  type="file"
                  multiple={false}
                  onChange={handleImageChange}
                />
              </div>

              <div className="form-field">
                <label>Collection</label>
                <select onChange={handleChange} name="collection">
                  {collections.map(collection => (
                    <option key={collection.name} value={collection.name}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Price *</label>
                <input name="price" onChange={handleChange} />
              </div>

              <div className="form-field">
                <label>Artwork tags</label>
                <textarea
                  name="tags"
                  placeholder="artwork tags seperated by commas"
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="artwork-form">
              <div>Share earnings</div>

              <div className="form-field single-row">
                <label>Cohart + community address</label>
                <input value="cohart_address" readOnly disabled />
              </div>
              <div className="form-field single-row">
                <label>Cohart + community</label>
                <input value="10" readOnly disabled />
              </div>

              <div className="form-field single-row">
                <label>Creator (yourself) address</label>
                <input value="your_address" readOnly disabled />
              </div>
              <div className="form-field single-row">
                <label>Creator (yourself) </label>
                <input name="shareOwner" onChange={handleChange} />
              </div>

              <div className="form-field single-row">
                <label>Share Person A address </label>
                <input
                  name="addressA"
                  defaultValue="0x72F8a330Ae8024A84b5BEc8F75c7931cA71BCf10"
                  onChange={handleChange}
                />
              </div>
              <div className="form-field single-row">
                <label>Share Person A </label>
                <input name="shareA" onChange={handleChange} />
              </div>

              <div className="form-field single-row">
                <label>Share Person B address </label>
                <input
                  name="addressB"
                  defaultValue="0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"
                  onChange={handleChange}
                />
              </div>
              <div className="form-field single-row">
                <label>Share Person B </label>
                <input name="shareB" />
              </div>
            </div>
          </div>
          <div className="submit-button-wrapper">
            <input
              type="submit"
              disabled={isMinting}
              name={isMinting ? 'sumitting' : 'submit'}
            />
            {!currentAccount && (
              <button className="waveButton" onClick={connectWallet}>
                Connect Wallet
              </button>
            )}
          </div>
        </form>

        <div className="details-view">
          <div className="left-col">
            <h2>NFT details</h2>
            <input
              onChange={e => setTokenId(Number(e.target.value || 0))}
              defaultValue="3"
              placeholder="tokenId"
            />
            <button onClick={handleViewDetails}>View Details</button>
          </div>
          {!!selectedToken && (
            <div className="selected-token">
              <div className="row">name: {selectedToken?.name}</div>
              <div className="row">
                description: {selectedToken?.description}
              </div>
              <div className="row">
                URI:{' '}
                <a href={selectedToken?.tokenURI} target="_blank">
                  {selectedToken?.tokenURI}
                </a>{' '}
              </div>
              <div className="row">Share to:</div>
              {selectedToken?.shares.map(({ to, percentage, name }) => (
                <div key={to}>
                  {name}: {percentage}%, address: "{to}"
                </div>
              ))}
              <div className="row">
                Tags:{' '}
                {selectedToken?.attributes
                  .filter(({ trait_type }) => trait_type === 'Tag')
                  .map(({ value }) => value)
                  .join(', ')}
              </div>

              <div className="row">Attributes:</div>
              {selectedToken?.attributes
                .filter(({ trait_type }) => trait_type !== 'Tag')
                .map(({ trait_type, value }, index) => (
                  <div key={index}>
                    {trait_type}: {value}
                  </div>
                ))}
              <div className="row" style={{ maxWidth: 300 }}>
                <img src={selectedToken?.image} width="100%" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
