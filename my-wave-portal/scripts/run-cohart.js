const { ethers, waffle } = require('hardhat')
const provider = waffle.provider

const CONTRACT_NAME = 'Cohart'

const { LazyMinter } = require('../lib/LazyMinter')

const main = async () => {
  const myContractFactory = await ethers.getContractFactory(CONTRACT_NAME)
  const contract = await myContractFactory.deploy()

  await contract.deployed()
  console.log('Contract address:', contract.address)

  

  // get contract balance

  let contractBalance = await provider.getBalance(contract.address)
  console.log('Contract balance:', ethers.utils.formatEther(contractBalance))

  const [owner, personA, personB, personC, personD, ...others] = await ethers.getSigners()

  const lazyMinter = new LazyMinter({ contract, signer: personA })

  const nftVoucher = await lazyMinter.createVoucher(
    0,
    'hihi_uri_000',
    ethers.utils.parseEther('0.1')
  )

  // TODO: save this vocher to backend

  // TODO: redem the vocer
  const tokenId = await contract.redeem(personB.address, nftVoucher, {
    value: ethers.utils.parseEther('0.1')
  })
  console.log({ tokenId })


  

  /*
   * Let's try two waves now
   */
  // const waveTxn = await CohartContract.wave("This is wave #1");
  // await waveTxn.wait();

  // const waveTxn2 = await CohartContract.wave("This is wave #2");
  // await waveTxn2.wait();

  // contractBalance = await ethers.provider.getBalance(CohartContract.address);
  // console.log(
  //   "Contract balance:",
  //   ethers.utils.formatEther(contractBalance)
  // );

  // let allWaves = await CohartContract.getAllWaves();
  // console.log(allWaves);
}

const runMain = async () => {
  try {
    await main()
    process.exit(0)
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

runMain()
