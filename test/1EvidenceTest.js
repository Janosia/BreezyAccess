const Evidence = artifacts.require("./Evidence");
const Register = artifacts.require("./Register");
const Case = artifacts.require("./Case");
contract("Evidence", (accounts) => {
  let evidenceInstance;
  let registerInstance;
  let caseInstance;
  beforeEach(async () => {
    evidenceInstance = await Evidence.new({ from: accounts[0] });
    registerInstance = await Register.new({ from: accounts[1] });
    caseInstance = await Case.new({ from: accounts[2] });
  });

  it("should register evidence", async () => {
    // Register users
    const user_reg = await registerInstance.register_user("Head Investigator", { from: accounts[0] });  
    // Create a case 
    const caseNumber = 1;
    await caseInstance.createcase("SomeCase", caseNumber, { from: accounts[0] });
    // Register evidence
    const evidence = "SomeEvidence";
    const initialEvidenceCount = await evidenceInstance.returnEvidCount(caseNumber);
    console.log(initialEvidenceCount.log);
        initialEvidenceCount.logs.forEach(log => {
            console.log(`Event: ${log.event}`);
            console.log(log.args);
        });
    await evidenceInstance._register_evidence(evidence, caseNumber, { from: accounts[0] });
    const finalEvidenceCount = await evidenceInstance.returnEvidCount(caseNumber);

    assert.equal(finalEvidenceCount, initialEvidenceCount + 1, "Evidence registered");
  });

  it("should assign level to evidence", async () => {
    const evidence = "SomeEvidence";
    const caseNumber = 2;

    await evidenceInstance.createcase("SomeCase", caseNumber, { from: accounts[0] });
    await evidenceInstance._register_evidence(evidence, caseNumber, { from: accounts[0] });

    const initialAssignedEvidencesCount = await evidenceInstance.returnAssignedEvidCount(caseNumber);
    await evidenceInstance.level_assignment(evidence, caseNumber, { from: accounts[0] });
    const finalAssignedEvidencesCount = await evidenceInstance.returnAssignedEvidCount(caseNumber);

    assert.equal(finalAssignedEvidencesCount, initialAssignedEvidencesCount + 1, "Level not assigned");
  });
});

