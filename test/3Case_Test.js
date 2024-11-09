// test/CaseTest.js
const Case = artifacts.require("./Case");
const AssignRole = artifacts.require("./AssignRole");

contract("Case", (accounts) => {
  let caseInstance;
  let ARInstance;

  beforeEach(async () => {
    // assignRoleInstance = await AssignRole.new();
    caseInstance = await Case.new({ from: accounts[3] });
    // ARInstance = await AssignRole.new({ from: accounts[3] });
  });
  // register user here 
  beforeEach(async () => {
    const user_reg = await caseInstance.register_user("Head Investigator", { from: accounts[0] });
    const inv_reg = await caseInstance.register_user("Lead Investigator", { from: accounts[1] });
  });


  it("should create a case", async () => {
    const caseName = "Test Case";
    const caseNumber = 1;
    await caseInstance.createcase(caseName, caseNumber, { from: accounts[0] });
    const hiAddress = await caseInstance.does_case_exists(caseNumber);
    
    assert.equal(hiAddress,true, "Case created successfully");
  });

  it("should add investigator to a case", async () => {
    const investigatorAddress = accounts[1];
    const caseNumber = 1;
    await caseInstance.createcase("Another Case", caseNumber, { from: accounts[0] });
    await caseInstance.add_investigator(investigatorAddress, caseNumber, { from: accounts[0] });

    const isInvestigatorAdded = await caseInstance.is_authorized(investigatorAddress, caseNumber);

    assert.equal(isInvestigatorAdded,true, "Investigator added to the case");
  });

  it("should remove investigator from a case", async () => {
    const investigatorAddress = accounts[1];
    const caseNumber = 1;

    await caseInstance.createcase("Yet Another Case", caseNumber, { from: accounts[0] });
    await caseInstance.add_investigator(investigatorAddress, caseNumber, { from: accounts[1] });

    const isInvestigatorAddedBeforeRemoval = await caseInstance.is_authorized(investigatorAddress, caseNumber);
    assert.isequal(isInvestigatorAddedBeforeRemoval, true, "Investigator added to the case before removal");

    await caseInstance.remove_investigator(caseNumber, investigatorAddress, { from: accounts[0] });

    const isInvestigatorAddedAfterRemoval = await caseInstance.is_authorized(investigatorAddress, caseNumber);
    assert.isequal(isInvestigatorAddedAfterRemoval, false, "Investigator has been removed from the case");
  });
});
