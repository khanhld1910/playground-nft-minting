const { ethers, waffle } = require('hardhat')
const provider = waffle.provider

const CONTRACT_NAME = 'Cohart'

async function main() {
  const MyContractFactory = await ethers.getContractFactory(CONTRACT_NAME)
  const myContract = await MyContractFactory.deploy()

  await myContract.deployed()

  const [owner, personA, personB, personC, personD, ...others] = await ethers.getSigners()

  const getBalance = async address =>
    console.log(address, ':', (await provider.getBalance(address)).toString())
  
  // await getA()
  // mint as personA, price: 1 ether
  await myContract.connect(personA).mintNft(
    'URI0',
    (1e18).toString(),
    [personC, personD],
    [20, 20],
  )
  // await getA()

  // => tokenId = 0

  // buy as personB

  // await getBalance()
  // await myContract.connect(personB).buyNft(0, { value: (1e18).toString() })
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
