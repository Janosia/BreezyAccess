
const AssignRole = artifacts.require("./AssignRole");
// T1 : simple registeration
// T2 : duplicate user
// T3 : Invalid Role
// T4 : Check for return role


contract("AssignRole", (accounts) => {
  
  let assignRoleInstance;
  beforeEach(async () => {
    assignRoleInstance = await AssignRole.new({ from: accounts[0] });
  });
  // Test 1 : User with valid designation only
  it("should allow registering user with a valid designation", async () => {  // only child i care about, please pass
    
    const designation = "Lead Investigator";
    const user = accounts[0];
    await assignRoleInstance.publicsetRole(designation, user);

    const level = await assignRoleInstance.publicreturnRole(user);
    assert.equal(level, 4, "User level should be  4");  
  });

  // Test 2: Duplicate User

  it("should not allow registering duplicate user ", async () => {  // you were built for failure (not) . Same tho 
    
    const designation = "Lead Investigator";
    const user = accounts[0];
    await assignRoleInstance.publicsetRole(designation, user );

    const level = await assignRoleInstance.publicreturnRole(user);
    assert.equal(level, 4, "User level should be  4");  
    try {
      await assignRoleInstance.publicsetRole(designation, user, { // duplicate registration
        from: accounts[0],
      });
      assert.fail("Expected an exception but none was thrown"); 
    } catch (error) {
      assert.include(
        error.message,
        "User Already Registered",
        "Should revert with 'User already Registered' error message"
      );
    }
  });

  // test 3: no invalid role
  it ("should not allow user with invalid designation to be registered", async() =>{

    const invalid = "Invalid";
    const user = accounts[0];

    try{
        await assignRoleInstance.publicsetRole(invalid, user, {from : accounts[0]});
        assert.fail("Expected Error but none was thrown");
    }catch(error){
        assert.include(
            error.message,
            "Invalid designation",
            "Should revert with 'Invalid designation' error message"
          );
    }
  });

  // test 4 : returnLevel function check
  it("should return assigned level of a registered user", async() => {
    const qualification = "Lead Investigator";
    const user = accounts[0];

    await assignRoleInstance.publicsetRole(qualification,user, {  // emits event for object registration
      from: accounts[0],
    });

    const tx = await assignRoleInstance.publicreturnRole(user);
    assert.equal(tx, 4, "Level is not as expected");
  });
});
