const { ethers } = require('hardhat')

const CONTRACT_NAME = 'Cohart'
const PROXY_CONTRACT_ADDRESS = '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82'

async function main() {
  const MyContractFactory = await ethers.getContractFactory(CONTRACT_NAME)
  const myContract = await MyContractFactory.attach(PROXY_CONTRACT_ADDRESS)

  const [owner, others] = await ethers.getSigners()

  // const res = await myContract.safeMint({
  //   "to": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
  //   "uri": "QmNPd6s2CaERvdWYdV2dLdsgsUGDXM9hGY1fMCjJzKpThL",
  //   "collectionName": "Hello World"
  // })
  // console.log({ res })

  // const a = await myContract.tokenURI(0)
  // console.log({a})

  // const a = await myContract.collectionTokens(0)
  // console.log({a})

  console.log(myContract)

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
