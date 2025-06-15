
const BibaAppend = artifacts.require("./BibaAppend"); 
module.exports = async function(deployer) {
  
  await deployer.deploy(BibaAppend); // Pass AssignLevel's & AssignRole's address to constructor
};