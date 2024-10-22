
const AssignRole = artifacts.require("./AssignRole");
const Register = artifacts.require("./Register");

contract("Register", async (accounts) => {
    // Get the contract instances.
    let assignRole;
    let register;

    // Before each test, deploy a new instance of the "AssignRole" contract. , can use before also but like keep an eye accounts used 
    //hr baar Useralreadyregistered aayega fir before ke same account use kra toh
    beforeEach(async () => {
        assignRole = await AssignRole.new();  // deploy kro
        register = await Register.new(assignRole.address, {from : accounts[0]}); // deploy kro
    });

    // Test case 1: Registering a new user with a valid designation.
    it("should register a new user with a valid designation", async () => {
        const designation = "Lead Investigator";

        await register.register_user(designation, { from: accounts[0] });

        const userRole = await assignRole.Roles(accounts[0]);

        assert.equal(userRole, 4, "User should be registered as Investigator");  //Magic Magic Magic 
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
    it("should not register a user who is already registered", async () => { // everything is wroking as it is supposed to but why????????????? T_T
        const designation = "Head Investigator";

        // Register the user with a valid designation.
        const first_tx = await register.register_user(designation, { from: accounts[0] });  // ye vala event emit kr rha h 
        //  @_@ ek event first non duplicacy vale user ke liye ayega
        try {
            await register.register_user(designation, { from: accounts[0] });  // firse register ke time nhi ayega event , ye require pe rukega 
            // If this code is reached, the test should fail because an error was expected.  
            assert.fail("User registration should fail for an already registered user"); 
        } catch (error) {
            assert(
                error.message.includes("User Already Registered"), 
                "Error message should indicate user is already registered"  // kyun krte register ho baar barr insta thodi h yeh 
            );
        }
    });
});