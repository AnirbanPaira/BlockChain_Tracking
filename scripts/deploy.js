const hre = require("hardhat");

async function main() {
  // Deploy the Tracking contract
  
  const Tracking = await hre.ethers.getContractFactory("Tracking");
  const tracking = await Tracking.deploy();

  // Wait for the contract to be mined
  await tracking.waitForDeployment();

  console.log(tracking);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
