
const Case = artifacts.require("./Case");
const AssignRole  = artifacts.require("./AssignRole");
const Evidence = artifacts.require("./Evidence");

module.exports = async function(deployer) {
 
  await deployer.deploy(AssignRole);
  const assigRoleInstance = await AssignRole.deployed();
  await deployer.deploy(Case, assigRoleInstance.address);
  const CaseInstance = await Case.deployed();
  await deployer.deploy(Evidence,  CaseInstance.address); 
};