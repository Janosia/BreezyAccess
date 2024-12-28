const BibaRead = artifacts.require("./BibaRead");

module.exports = async function(deployer) {
  
  await deployer.deploy(BibaRead);
};