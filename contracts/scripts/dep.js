const ethers = require("ethers");
const Contract = require("../out/Contract.sol/Contract.json");
require("dotenv").config();

const main = async () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.mumbai);
  const wallet = new ethers.Wallet(process.env.pk1, provider);
  const contractFactory = new ethers.ContractFactory(
    Contract.abi,
    Contract.bytecode,
    wallet
  );

  let contract = await contractFactory.deploy();
  console.log(contract.address);
  console.log(contract.deployTransaction);
  // await contract.deployTransaction.wait();
  await contract.deployed();
  console.log("predictionMarket deployed at:", contract.address);
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
