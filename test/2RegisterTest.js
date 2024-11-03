
const AssignRole = artifacts.require("./AssignRole");
const Register = artifacts.require("./Register");

contract("Register", async (accounts) => {
    // let assignRole;
    let register;
    
    beforeEach(async () => {
        register = await Register.new({ from: accounts[0] }); 
    });

    // Test case 1: Registering a new user with a valid designation.
    it("should register a new user with a valid designation", async () => {
        const designation = "Lead Investigator";
        const expected_level = 4;
        const result = await register.register_user(designation, { from: accounts[0] });
        
        const userRole = await register.publicreturnRole(accounts[0]);
        assert.equal(userRole.toNumber(), expected_level,"User role does not match expected role");  
    });

    // Test case 2: Trying to register a user with an invalid designation.
    it("should not register a user with an invalid designation", async () => {
        const invalidDesignation = "InvalidRole";
        // Attempt to register the user with an invalid designation.
        try {
            await register.register_user(invalidDesignation, { from: accounts[0] });
            // If this code is reached, the test should fail because an error was expected.  
            assert.fail("User registration should fail for invalid designation");
        } catch (error) {
            assert(
                error.message.includes("Invalid designation"), 
                "Error message should show invalid Designantion"  // tnp coords voice : shi se bhara kro form 
            );
        }
    });

    // Test case 3: Trying to register a user who is already registered.
    it("should not register a user who is already registered", async () => { 
        const designation = "Head Investigator";

        // Register the user with a valid designation.
        const first_tx = await register.register_user(designation, { from: accounts[0] });
        try {
            await register.register_user(designation, { from: accounts[0] });  // firse register ke time nhi ayega event , ye require pe rukega 
            // If this code is reached, the test should fail because an error was expected.  
            assert.fail("User registration should fail for an already registered user"); 
        } catch (error) {
            assert(
                error.message.includes("User Already Registered"), 
                "Error message should indicate user is already registered"  
            );
        }
    });
});