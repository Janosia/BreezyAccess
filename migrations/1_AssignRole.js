const AssignRole= artifacts.require("./AssignRole");

module.exports = async function(deployer){
    deployer.deploy(AssignRole);
};