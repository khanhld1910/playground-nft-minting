const main = async () => {
  const myContractFactory = await hre.ethers.getContractFactory('HelloSolidity')
  
  const myContract = await myContractFactory.deploy()
  await myContract.deployed()
  console.log('Contract address:', myContract.address)

  // Now we can access contract using myContract
  
  // const address = await myContract.test()
  // console.log({address})

  // await myContract.forever()
  
  const num = await myContract.ifElse()
  console.log({num})

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
