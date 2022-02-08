const { ethers, upgrades } = require('hardhat')

const CONTRACT_NAME = 'Cohart'
const PROXY_CONTRACT_ADDRESS = '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82'

async function main() {
  const MyContractFactory = await ethers.getContractFactory(CONTRACT_NAME)

  console.log('Upgrading', CONTRACT_NAME, '...')
  await upgrades.upgradeProxy(PROXY_CONTRACT_ADDRESS, MyContractFactory, {
    kind: 'uups',
    initializer: 'initialize'
  })
  console.log(CONTRACT_NAME, 'upgraded')
}

main()
