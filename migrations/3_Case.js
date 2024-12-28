const Case = artifacts.require("./Case");

module.exports = async function(deployer) {
  
  await deployer.deploy(Case); 
};