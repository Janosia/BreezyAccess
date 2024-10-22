// test/CaseTest.js
const Case = artifacts.require("./Case");
const AssignRole = artifacts.require("./AssignRole");

contract("Case", (accounts) => {
  let caseInstance;
  let assignRoleInstance;

  before(async () => {
    assignRoleInstance = await AssignRole.new();
    caseInstance = await Case.new();
  });

  it("should create a case", async () => {
    const caseName = "Test Case";
    const caseNumber = 1;

    await caseInstance.createcase(caseName, caseNumber, { from: accounts[0] });
    const hiAddress = await caseInstance.returnHI(caseNumber);

    assert.equal(hiAddress, accounts[0], "Head Investigator set correctly");
  });

  it("should add investigator to a case", async () => {
    const investigatorAddress = accounts[1];
    const caseNumber = 1;

    await caseInstance.createcase("Another Case", caseNumber, { from: accounts[0] });
    await caseInstance.add_investigator(investigatorAddress, caseNumber, { from: accounts[0] });

    const isInvestigatorAdded = await caseInstance.is_authorized(investigatorAddress, caseNumber);

    assert.isequal(isInvestigatorAdded,true, "Investigator added to the case");
  });

  it("should remove investigator from a case", async () => {
    const investigatorAddress = accounts[1];
    const caseNumber = 1;

    await caseInstance.createcase("Yet Another Case", caseNumber, { from: accounts[0] });
    await caseInstance.add_investigator(investigatorAddress, caseNumber, { from: accounts[0] });

    const isInvestigatorAddedBeforeRemoval = await caseInstance.is_authorized(investigatorAddress, caseNumber);
    assert.isequal(isInvestigatorAddedBeforeRemoval, true, "Investigator added to the case before removal");

    await caseInstance.remove_investigator(caseNumber, investigatorAddress, { from: accounts[0] });

    const isInvestigatorAddedAfterRemoval = await caseInstance.is_authorized(investigatorAddress, caseNumber);
    assert.isequal(isInvestigatorAddedAfterRemoval, false, "Investigator has been removed from the case");
  });

  // Add more test cases as needed

});
