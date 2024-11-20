const Case = artifacts.require("./Case");
const AssignRole = artifacts.require("./AssignRole");
module.exports = async function(deployer) {
  
  await deployer.deploy(AssignRole); 
  
  const assignRoleInstance = await AssignRole.deployed();
  await deployer.deploy(Case,assignRoleInstance.address); 
};