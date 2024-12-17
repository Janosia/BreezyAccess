// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;
import "./AssignRole.sol";
import "./Register.sol";
///@title this contract checks whether requestor is head investigator or not
///and then allows creation of case
/// governs evidence addition, deletion, also has functions for managing DAC
contract Case is AssignRole{
    struct SCase {
        string ID;
        bytes32 IDhash;
        mapping(bytes32 => uint) AssignedEvidences;
        mapping(bytes32 => uint) UnassignedEvidences;
        mapping(address => uint) investigators;
        address HI;
        uint evid;
        uint stipulatedtime;
        uint creationtime;
        uint closetime;
    }
    uint[] Cases;
    mapping(uint => SCase) cases;
    event CaseRegistrationDone(string, string, uint);
    event InvestigatorRemoved(string, address, uint);
    event InvestigatorAdded(string, uint, string,address,string,  uint);
    event EvidenceAssignedLevel(string, bytes32, string, uint, string, uint);
    event EvidenceRegistered(string, bytes32, address);
    event EvidenceDeleted(string, uint, bytes32);
    event CaseClosed(string, uint);
    ///@notice checks if case has already been created
    function does_case_exists(uint num) public view returns (bool) {
        for (uint i = 0; i < Cases.length; i++) {
            if (Cases[i] == num) {
                return true;
            }
        }
        return false;}
    /// @notice creates a case
    /// @param name Name of the Case File ; @param case_number Unique Number assigned to case
    function createcase(string calldata name, uint case_number) public payable {
        require(
            DoesUserExists(msg.sender) == true,
            "User is not registered"
        );
        require(
            does_case_exists(case_number) == false,
            "Case is already created"
        );
        require(
            returnRole(msg.sender) == 1,
            "Only Head Investigator can create cases"
        );
        SCase storage newCase = cases[case_number];
        newCase.ID = name;
        newCase.IDhash = keccak256(abi.encodePacked(name));
        newCase.HI = msg.sender;
        newCase.investigators[msg.sender] = 1;
        newCase.stipulatedtime = 25;
        newCase.creationtime = block.timestamp;
        newCase.closetime = 0;
        Cases.push(case_number);
        emit CaseRegistrationDone("Case Registered", name, case_number);
    }

    ///@notice returns Head Investigator of a case
    function returnHI(uint case_number) public payable returns (address) {
        SCase storage newCase = cases[case_number];
        return (newCase.HI);
    }

    ///@notice returns whether an user is authorised to work on a case
    /// @param user address of user requesting access; @param number Unique Case Number
    function is_authorized(
        address user,
        uint number
    ) public view returns (bool) {
        // DAC
        SCase storage nC = cases[number];
        if (nC.investigators[user] == 1) {
            return true;
        }
        return false;
    }

    /// @notice this introduces DAC, allows Head Investigator to modify access rights
    function add_investigator(address inv, uint num) public payable {
        SCase storage newC = cases[num];
        newC.investigators[inv] = 1;
        uint role_inv = publicreturnRole(inv);
        emit InvestigatorAdded("Investigator added to case", num , "address", inv, "level", role_inv );
    }

    /// @notice checks whether evidence exists
    /// @param case_number unique id of case, @param key hash of evidence which has to be assigned level 
    function does_evidence_exists(
        uint case_number,
        bytes32 key
    ) public view returns (bool) {
        require(does_case_exists(case_number) == true, "Case does not exists");
        SCase storage c = cases[case_number];
        if (c.AssignedEvidences[key] > 0) {
            return true;
        }
        if (c.UnassignedEvidences[key] > 0) {
            return true;
        }
        return false;
    }

    /// @notice checks whether level is assigned to evidence
    function is_level_assigned(
        uint case_number,
        bytes32 key
    ) public view returns (bool) {
        SCase storage c = cases[case_number];
        if (c.UnassignedEvidences[key] == 1) {
            return false;
        }
        return true;
    }

    ///@notice DAC policy allows removal of an investigator from case
    function remove_investigator(uint case_number, address inv) public payable {
        // remove an investigator from DAC policy
        SCase storage nC = cases[case_number];
        nC.investigators[inv] = 0;
        emit InvestigatorRemoved(
            "Investigator has been removed from case",
            inv,
            case_number
        );
    }

    /// @notice allows Head Investigator to assign integrity level to an evidence
    function setlevel(bytes32 key, uint case_num, uint level) internal {
        SCase storage nc = cases[case_num];
        nc.AssignedEvidences[key] = level; // addition to Assigned evidences
        nc.UnassignedEvidences[key] = 0; // removal from Unassigned evidences
        emit EvidenceAssignedLevel("Evidence", key, "assigned level", level, "for case", case_num);
    }

    ///@notice caller function to assign level to an evidence 
    function assign_inl(uint case_num, string calldata ev, uint level) public payable {
        // assign level
        bytes32 key = keccak256(abi.encodePacked(ev));
        require(returnHI(case_num)==msg.sender, "Only Head Investigator can assign level to evidence");
        require(does_case_exists(case_num) == true, "Case does not exists");
        require(
            does_evidence_exists(case_num, key) == true,
            "Evidence does not exists"
        );
        require(is_level_assigned(case_num, key) == false, "Level assigned");
        setlevel(key, case_num, level);
    }

    ///@notice allows user to register new information
    /// @param case_num Unique case ID; @param ev information ; @param user address of requestor
    function register_evi(
        uint case_num,
        string memory ev,
        address user
    ) public payable {
        bytes32 key = keccak256(abi.encodePacked(ev));
        require(does_case_exists(case_num) == true, "Case does not exists");
        require(
            does_evidence_exists(case_num, key) == false,
            "Evidence exists"
        );
        SCase storage nC = cases[case_num];
        nC.UnassignedEvidences[key] = 1;
        nC.evid += 1;
        emit EvidenceRegistered("Evidence has been registered by", key, user);
    }

    ///@notice return level of integrity assigned to an evidence
    ///@param key unique identifier of evidence
    function return_level(
        uint case_num,
        bytes32 key
    ) public view returns (uint) {
        require(does_case_exists(case_num) == true, "Case does not exists");
        require(
            does_evidence_exists(case_num, key) == true,
            "Evidence does not exists"
        );
        require(is_level_assigned(case_num, key) == true, "Evidence not valid");
        SCase storage nc = cases[case_num];
        uint lvl = nc.AssignedEvidences[key];
        return lvl;
    }

    ///@notice allows deletion of evidence
    function delete_evidence(bytes32 key, uint case_num) internal {
        SCase storage nc = cases[case_num];
        require(does_case_exists(case_num) == true, "Case does not exists");
        require(
            is_closed(case_num) == 1,
            "Case is still open. Cannot delete evidence"
        );
        require(
            does_evidence_exists(case_num, key) == true,
            "Evidence does not exists"
        );
        require(is_level_assigned(case_num, key) == true, "Evidence not valid");
        nc.AssignedEvidences[key] = 0;
        emit EvidenceDeleted(
            "Evidence from Case has been deleted",
            case_num,
            key
        );
    }

    ///@notice closes a case
    function case_closing(uint case_num) internal {
        require(
            returnRole(msg.sender) == 1,
            "Only Head Investigator can create cases"
        );
        SCase storage nc = cases[case_num];
        require(
            nc.HI == msg.sender,
            "Only Head Investigator of the case can close it."
        );
        nc.closetime = block.timestamp;
        emit CaseClosed("Case is closed", case_num);
    }

    function is_closed(uint case_num) internal view returns (uint) {
        SCase storage nc = cases[case_num];
        if (nc.closetime == 0) {
            return 0;
        }
        return 1;
    }

    function public_set_level(bytes32 key, uint case_num, uint level) public{
        setlevel(key, case_num, level);
    }
}
