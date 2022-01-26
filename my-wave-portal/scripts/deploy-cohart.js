const main = async () => {
  const contractFactory = await hre.ethers.getContractFactory("Cohart");
  const myContract = await contractFactory.deploy();
  // const myContract = await contractFactory.deploy({
  //   value: hre.ethers.utils.parseEther("0.1"),
  // });
  
  await myContract.deployed()

  console.log('Contract address: ', myContract.address)
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
