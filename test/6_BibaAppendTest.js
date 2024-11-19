
const AssignRole = artifacts.require("./AssignRole");
const Case = artifacts.require("./Case");
const BibaAppend = artifacts.require("./BibaAppend");

// T1 : simple append for strictly greater than
// T2 : simple append for eqaul
// T3 : rejected append

contract("BibaAppend", (accounts) => {
  
  let assignRoleInstance;
  let caseInstance;
  let bibaappendInstance;
  beforeEach(async () => {
    assignRoleInstance = await AssignRole.new({ from: accounts[0] });
    caseInstance = await Case.new({ from: accounts[1] });
    bibaappendInstance = await BibaAppend.new({from : accounts[0]});
  });

  // Test 1 : Simple Append with strictly greater than values
  it("should allow append to those users having integrity Level strictly greater than evidence", async() =>{
    const desig = "Investigator" ;// 5
    const key = web3.utils.keccak256("Sample");
    const user = accounts[0];

    // register user
    // create case
    
    await caseInstance.setlevel(key, {from: accounts[0]}); // register og evidence
    await assignRoleInstance.publicsetRole(desig,user, {from: accounts[0]}); // register user

    const nkey = web3.utils.keccak256("Add to Sample"); // hash fro appended evidence
    const qua = "Certain"; // qualification of appended evidence
    const tx = await bibaappendInstance.append_allowed(key, user, nkey, qua); // carry out the function

    assert(tx, true, "User should be allowed to append to the evidence");
  });

  // Test 2 : Simple Append with equal values
  it("should allow append to those users having integrity Level equal to evidence", async() =>{
    const desig = "Investigator" ;// 5
    const key = web3.utils.keccak256("Sample");
    const user = accounts[0];
    
    await caseInstance.setlevel(key, {from: accounts[0]}); // register evidence
    await assignRoleInstance.publicsetRole(desig,user, {from: accounts[0]}); // register user

    const nkey = web3.utils.keccak256("Add to Sample");
    const qua = "Certain";
    const tx = await bibaappendInstance.append_allowed(key, user, nkey, qua);

    assert(tx, true, "User should be allowed to append to the evidence");
  });

  // Test 3 : Simple Append which should be rejected
  it("should allow not append rights to those users having integrity level strictly lower than evidence", async() =>{
    const desig = "Investigator" ;// 5
    const key = web3.utils.keccak256("Sample");
    const user = accounts[0];
    
    await caseInstance.setlevel(key, {from: accounts[0]}); // register evidence
    await assignRoleInstance.publicsetRole(desig,user, {from: accounts[0]}); // register user

    const nkey = web3.utils.keccak256("Add to Sample");
    const qua = "Certain";
    
    try{
        const tx = await bibaappendInstance.append_allowed(key, user, nkey, qua);
        assert.fail("This should fail, something is wrong")
    }catch(error){
        assert(
            error.message.includes("User is not authorized to append to evidence"), 
            "Error message should indicate that append operation is not allowed"   
        );
    }
  });

});
