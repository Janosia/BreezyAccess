
const AssignRole = artifacts.require("./AssignRole");
const Case = artifacts.require("./Case");
const BibaAppend = artifacts.require("./BibaAppend");

// T1 : simple append for strictly greater than
// T2 : simple append for eqaul
// T3 : rejected append

contract("BibaAppend", (accounts) => {

  let bibaappendInstance;
  before(async () => {
    bibaappendInstance = await BibaAppend.new({from : accounts[0]});
  });

  // Test 1 : Simple Append with strictly greater than values
  it("should allow append to those users having integrity Level strictly greater than evidence", async() =>{
    const key = web3.utils.keccak256("Sample");
    const user1 = accounts[0]; //INV
    const user = accounts[1]; //HI
    const caseNumber="Mock Case";
    const design = "Head Investigator";
    const inv= "Lead Investigator";
    await bibaappendInstance.publicsetRole(design,user);
    await bibaappendInstance.publicsetRole(inv,user1);
    
    await bibaappendInstance.createcase(caseNumber,3, {from:accounts[1]});
    
    const mock = "Trial Evidence"
    await bibaappendInstance.register_evi(3,mock,user);
    await bibaappendInstance.public_set_level(key,3,2);
    const roleLevel = await bibaappendInstance.publicreturnRole(user1);
    const evidenceLevel = await bibaappendInstance.return_level.call(3, key);
    console.log("Role Level:", roleLevel);
    console.log("Evidence Level:", evidenceLevel);
    await bibaappendInstance.add_investigator(user1, 3);
    const nkey = web3.utils.keccak256("Add to Sample"); 
    const qua = "Certain"; // qualification of appended evidence
    const tx = await bibaappendInstance.append_allowed(key, user1, nkey, 3); // carry out the function

    assert(tx, true, "User should be allowed to append to the evidence");
  });

  // Test 2 : Simple Append with equal values
  it("should allow append to those users having integrity Level equal to evidence", async() =>{
    const key = web3.utils.keccak256("Sample");
    const user1 = accounts[2]; //INV
    const user = accounts[3]; //HI
    const caseNumber=1;
    const design = "Head Investigator";
    const inv= "Lead Investigator";
    await bibaappendInstance.publicsetRole(design,user);
    await bibaappendInstance.publicsetRole(inv,user1);
    await bibaappendInstance.createcase(caseNumber,4, {from:accounts[3]});
    await bibaappendInstance.setlevel(key, caseNumber,4);
    const desig = "Lead Investigator" ;// 5
    const nkey = web3.utils.keccak256("Add to Sample");
    const qua = "Certain";
    const tx = await bibaappendInstance.append_allowed(key, user, nkey, qua);
    assert(tx, true, "User should be allowed to append to the evidence");
  });

  // Test 3 : Simple Append which should be rejected
  it("should allow not append rights to those users having integrity level strictly lower than evidence", async() =>{
    const key = web3.utils.keccak256("Sample");
    const user1 = accounts[0]; //INV
    const user = accounts[4]; //HI
    const caseNumber=1;
    const design = "Head Investigator";
    const inv= "Lead Investigator";
    await bibaappendInstance.publicsetRole(design,user);
    await bibaappendInstance.publicsetRole(inv,user1);
    await bibaappendInstance.createcase(caseNumber,3);
    await bibaappendInstance.setlevel(key, caseNumber,3);
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
