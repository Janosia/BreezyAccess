const Evidence = artifacts.require("./Evidence");

module.exports = async function(deployer) {
 
  
  await deployer.deploy(Evidence); 
};