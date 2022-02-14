const main = async () => {
  const myContractFactory = await hre.ethers.getContractFactory("Cohart");
  const CohartContract = await myContractFactory.deploy({
    // value: hre.ethers.utils.parseEther("0.1")
  });
  await CohartContract.deployed();
  console.log("Contract address:", CohartContract.address);

  // get contract balance

  let contractBalance = await hre.ethers.provider.getBalance(
    CohartContract.address
  )
  console.log(
    'Contract balance:',
    hre.ethers.utils.formatEther(contractBalance)
  )

  /*
   * Let's try two waves now
   */
  // const waveTxn = await CohartContract.wave("This is wave #1");
  // await waveTxn.wait();

  // const waveTxn2 = await CohartContract.wave("This is wave #2");
  // await waveTxn2.wait();

  // contractBalance = await hre.ethers.provider.getBalance(CohartContract.address);
  // console.log(
  //   "Contract balance:",
  //   hre.ethers.utils.formatEther(contractBalance)
  // );

  // let allWaves = await CohartContract.getAllWaves();
  // console.log(allWaves);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();