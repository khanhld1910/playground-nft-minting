const main = async () => {
  const myContractFactory = await hre.ethers.getContractFactory('Cohart')
  
  const myContract = await myContractFactory.deploy()
  await myContract.deployed()
  console.log('Contract address:', myContract.address)

  const [owner, ...others] = await hre.ethers.getSigners()

  // console.log({owner, others})

  

  // const result = await myContract.safeMint(
  const result = await myContract
    .connect(others[0])
    .safeMint(
      others[0].address,
      'uri_0',
      'artwork_0',
      [
        'tag_0_0',
        'tag_0_1',
      ],
      [
        {
          to: owner.address,
          name: 'Cohart',
          percentage: 10,
        },
        {
          to: others[0].address,
          name: 'Myself',
          percentage: 80,
        },
        {
          to: others[1].address,
          name: 'My friend',
          percentage: 10,
        },
      ]
    )

  // const tags = await myContract.getTags(0)
  const shares = await myContract.getShares(0)

  console.log({
    // result,
    // tags,
    shares,
    huhu: typeof shares,
  })

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
