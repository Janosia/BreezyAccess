const BibaRead = artifacts.require("./BibaRead");

// T1 : simple read strictly less than
// T2 : simple read eqaul
// T3 : rejected read

contract("BibaRead", (accounts) => {
  
  let bibareadInstance;
  beforeEach(async () => {
    bibareadInstance = await BibaRead.new({ from: accounts[0] });
  });

  // Test 1 : Simple Read with strictly less tahn values
  it("should allow read to those users having integrity level strictly lower than evidence", async() =>{
    const desig = " Lead Investigator" ;// 4
    const qualification = 7;
    const key = web3.utils.keccak256("Sample");
    const user = accounts[0];
    
    await bibareadInstance.setlevel(qualification, key, {from: accounts[0]}); // register evidence
    

    const tx = await bibareadInstance.read_allowed(key, user);

    assert(tx, true, "User should be allowed to read the evidence");
  });

  // Test 2 : Simple Read with equal values
  it("should allow read to those users having integrity level equal to evidence", async() =>{
    const desig = "Investigator" ;// 5
    const qualification = "Probable"; //5
    const key = web3.utils.keccak256("Sample");
    const user = accounts[0];
    
    await bibareadInstance.setelevel(qualification, key, {from: accounts[0]}); // register evidence
    await bibareadInstance.setRole(desig,user, {from: accounts[0]}); // register user

    const tx = await bibareadInstance.read_allowed(key, user);

    assert(tx, true, "User should be allowed to read the evidence");
  });

  // Test 3 : Simple Read which should be rejected
  it("should allow not read rights to those users having integrity level strictly higher than evidence", async() =>{
    const desig = "Investigator" ;// 5
    const qualification = "Incorrect"; //1
    const key = web3.utils.keccak256("Sample");
    const user = accounts[0];
    
    await bibareadInstance.setlevel(qualification, key, {from: accounts[0]}); // register evidence
    await bibareadInstance.setRole(desig,user, {from: accounts[0]}); // register user

    
    try{
        const tx = await bibareadInstance.read_allowed(key, user);
        assert.fail("This should fail, something is wrong")
    }catch(error){
        assert(
            error.message.includes("User is not authorized to read evidence"), 
            "Error message should indicate that read operation is not allowed"   
        );
    }
  });

});
