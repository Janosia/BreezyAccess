
const AssignRole = artifacts.require("AssignRole");
const Case = artifacts.require("Case");
const Evidence = artifacts.require("Evidence");

contract("Evidence", (accounts) => {
  /*let evidenceInstance;
  let assignLevelInstance;

  beforeEach(async () => {
    assignLevelInstance = await AssignLevel.new({ from: accounts[0] });
    evidenceInstance = await Evidence.new(assignLevelInstance.address, {from: accounts[0]});
  });*/

  /*it("should allow registering evidence with a valid qualification", async () => {  // only child i care about, please pass
    
    const qualification = "Certain";
    const evidenceHash = web3.utils.keccak256("Sample Evidence");  // can use sha256 instead 

    await evidenceInstance._register_evidence(qualification, evidenceHash, {from: accounts[0],});

    const level = await assignLevelInstance.Objects(evidenceHash);
    assert.equal(level.toNumber(), 7, "Evidence level should be 7 (Certain)");  // cuz we changed casey's scaling cuz well meri marzi ig , 
  });



  it("should not allow registering duplicate evidence", async () => {  // you were built for failure (not) . Same tho 
    
    const qualification = "Almost Certain";
    const evidenceHash = web3.utils.keccak256("Duplicate Evidence");

    await evidenceInstance._register_evidence(qualification, evidenceHash, {
      from: accounts[0],
    });

    try {
      await evidenceInstance._register_evidence(qualification, evidenceHash, {
        from: accounts[0],
      });
      assert.fail("Expected an exception but none was thrown"); // live to disappoint babe  >_< chu~~
    } catch (error) {
      assert.include(
        error.message,
        "Evidence already added",
        "Should revert with 'Evidence already added' error message"
      );
    }
  });*/
  // test/EvidenceTest.js

  let assignRoleInstance;
  let caseInstance;
  let evidenceInstance;

  before(async () => {
    assignRoleInstance = await AssignRole.new();
    caseInstance = await Case.new();
    evidenceInstance = await Evidence.new(caseInstance.address);
  });

  it("should register evidence", async () => {
    const evidence = "SomeEvidence";
    const caseNumber = 1;

    await caseInstance.createcase("SomeCase", caseNumber, { from: accounts[0] });

    const initialEvidenceCount = await caseInstance.returnEvidCount(caseNumber);
    await evidenceInstance._register_evidence(evidence, caseNumber, { from: accounts[0] });
    const finalEvidenceCount = await caseInstance.returnEvidCount(caseNumber);

    assert.equal(finalEvidenceCount, initialEvidenceCount + 1, "Evidence registered");
  });

  it("should assign level to evidence", async () => {
    const evidence = "SomeEvidence";
    const caseNumber = 2;

    await caseInstance.createcase("SomeCase", caseNumber, { from: accounts[0] });
    await evidenceInstance._register_evidence(evidence, caseNumber, { from: accounts[0] });

    const initialAssignedEvidencesCount = await caseInstance.returnAssignedEvidCount(caseNumber);
    await evidenceInstance.level_assignment(evidence, caseNumber, { from: accounts[0] });
    const finalAssignedEvidencesCount = await caseInstance.returnAssignedEvidCount(caseNumber);

    assert.equal(finalAssignedEvidencesCount, initialAssignedEvidencesCount + 1, "Level not assigned");
  });

  // Add more test cases as needed

});

