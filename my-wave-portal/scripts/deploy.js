const { ethers, upgrades } = require('hardhat')

const CONTRACT_NAME = 'Cohart'

async function main() {
  const MyContractFactory = await ethers.getContractFactory(CONTRACT_NAME)

  console.log('Deploying', CONTRACT_NAME, '...')
  const myContract = await upgrades.deployProxy(MyContractFactory, [], {
    kind: 'uups',
    initializer: 'initialize'
  })

  await myContract.deployed()
  console.log(CONTRACT_NAME, 'deployed to:', myContract.address)
}

main()
