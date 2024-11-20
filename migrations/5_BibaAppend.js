const AssignRole = artifacts.require("./AssignRole");
const Case = artifacts.require("./Case")
const BibaAppend = artifacts.require("./BibaAppend"); 
module.exports = async function(deployer) {
  await deployer.deploy(AssignRole);
  const assigRoleInstance = await AssignRole.deployed();
  await deployer.deploy(Case, assigRoleInstance.address);
  const CaseInstance = await Case.deployed();
  await deployer.deploy(BibaAppend, assigRoleInstance.address, CaseInstance.address); // Pass AssignLevel's & AssignRole's address to constructor
};