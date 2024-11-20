const AssignRole = artifacts.require("./AssignRole");
const Case = artifacts.require("./Case");
const BibaRead = artifacts.require("./BibaRead");

module.exports = async function(deployer) {
  // Deploy AssignRole
  await deployer.deploy(AssignRole);
  const assigRoleInstance = await AssignRole.deployed();
  await deployer.deploy(Case, assigRoleInstance.address);
  const CaseInstance = await Case.deployed();
  // Deploy BibaRead and pass the addresses of AssignLevel, AssignRole, and Case
  await deployer.deploy(BibaRead,  assigRoleInstance.address, CaseInstance.address);
};