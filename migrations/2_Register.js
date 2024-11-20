const AssignRole = artifacts.require("./AssignRole");
const Register = artifacts.require("./Register");

module.exports = async function(deployer) {
  await deployer.deploy(AssignRole); // Deploy AssignLevel first
  const assignRoleInstance = await AssignRole.deployed();

  await deployer.deploy(Register, assignRoleInstance.address); // Pass AssignLevel's address to Evidence's constructor
};