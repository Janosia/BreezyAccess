// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./AssignRole.sol";
///@title allows creation of case & manages all evidence related to a case
/// DAC policy 
contract Case is AssignRole{
    struct SCase {
        string ID;
        mapping(string => uint) AssignedEvidences;
        mapping(string => uint) UnassignedEvidences;
        mapping(address => uint) investigators;
        bytes32 key;
        address HI;
        uint evid;
    }
    mapping(uint=>uint) Cases;
    mapping(uint=>address)Case_Head_Inv;
    mapping(uint => SCase) active_cases;
    event Case_Registration_Done(string, uint, string, address );
    event Investigator_Removed(string, address,string, uint);
    event Investigator_Added(string, address, string, uint);
    event Evidence_Assigned_Level(string, bytes32, string, uint);
    event Evidence_Registered(string, address, string, bytes32);
    event Can_Register_Evidence(string, address, string,uint);
    ///@notice checks if case has already been created
    function does_case_exists(uint num) public view returns (bool) {
        return Cases[num]==1;}
    /// @notice creates a case
    function create_case( uint case_number, bytes32 AESkey) public payable {
        require(RegisteredUsers[msg.sender] == 1,"User is not registered");
        require(does_case_exists(case_number) == false,"Case is already created");
        require(returnRole(msg.sender) == 1,"Only Head Investigator can create cases");
        SCase storage newCase = active_cases[case_number];
        newCase.HI = msg.sender;
        newCase.investigators[msg.sender] = 1;
        newCase.key=AESkey;
        Cases[case_number]=1;
        Case_Head_Inv[case_number]=msg.sender;
        emit Case_Registration_Done("Case Registered", case_number, " by user ", msg.sender);
    }

    ///@notice returns Head Investigator of a case
    function returnHI(uint case_number) public payable returns (address) {
        return (Case_Head_Inv[case_number]);
    }

    ///@notice returns whether an user is authorised to work on a case
    /// @param user address of user requesting access; @param number Unique Case Number
    function is_authorized(
        address user,
        uint number
    ) public view returns (bool) {
        SCase storage nC = active_cases[number];
        if (nC.investigators[user] == 1) {
            return true;
        }
        return false;
    }

    /// @notice allows Head Investigator to modify access rights
    function add_investigator(address inv, uint num) public payable {
        SCase storage newC = active_cases[num];
        newC.investigators[inv] = 1;
        emit Investigator_Added(
            "Investigator" ,
            inv,
            " added to case ",
            num
        );
    }

    /// @notice checks whether evidence exists
    /// @param case_number unique id of case, @param key hash of evidence which has to be assigned level 
    function does_evidence_exists(
        uint case_number,
        string memory key
    ) public view returns (bool) {
        SCase storage c = active_cases[case_number];
        if (c.AssignedEvidences[key] > 0 || c.UnassignedEvidences[key] > 0) {
            return true;
        }
        return false;
    }

    /// @notice checks whether level is assigned to evidence
    function is_level_assigned(
        uint case_number,
        string memory key
    ) public view returns (bool) {
        SCase storage c = active_cases[case_number];
        if (c.UnassignedEvidences[key] == 1) {
            return false;
        }
        return true;
    }

    ///@notice DAC policy allows removal of an investigator from case
    function remove_investigator(uint case_number, address inv) public payable {
        // remove an investigator from DAC policy
        SCase storage nC = active_cases[case_number];
        nC.investigators[inv] = 0;
        emit Investigator_Removed(
            "Investigator has been removed" ,
            inv,
            "from case",
            case_number
        );
    }

    /// @notice allows Head Investigator to assign integrity level to an evidence
    function setlevel(string memory key, uint case_num, uint level) internal {
        SCase storage nc = active_cases[case_num];
        nc.AssignedEvidences[key] = level; // addition to Assigned evidences
        nc.UnassignedEvidences[key] = 0; // removal from Unassigned evidences
        bytes32 KC = keccak256(abi.encodePacked(key));
        emit Evidence_Assigned_Level("Evidence",  KC,  "has been assigned level", level);
    }

    ///@notice caller function to assign level to an evidence 
    function assign_inl(uint case_num, string memory key, uint level) public payable {
        require(returnHI(case_num)==msg.sender, "Only Head Investigator can assign level to evidence");
        require(does_case_exists(case_num) == true, "Case does not exists");
        require(
            does_evidence_exists(case_num, key) == true,
            "Evidence does not exists"
        );
        require(is_level_assigned(case_num, key) == false, "Level assigned");
        setlevel(key, case_num, level);
    }

    ///@notice check if user is authorised to add evidence
    /// @param case_num Unique case ID;  
    function register_evi(
        uint case_num
    ) public payable returns (bool){
        // bytes32 key = keccak256(abi.encodePacked(ev));
        require(does_case_exists(case_num) == true, "Case does not exists");
        require(is_authorized(msg.sender, case_num) == true, "User not authorised to add evidence to case");
        emit Can_Register_Evidence("User", msg.sender, " can register evidence to case ", case_num);
        return true;
    }

    /// @notice returns if an AES key already exists
    function returnAESkey(uint case_num) public view returns(bytes32){
        SCase storage nC = active_cases[case_num];
        return nC.key;
    }
    ///@notice to check if a key exists in case
    function does_key_Exists(uint case_num) public view returns(bool){
        SCase storage nC = active_cases[case_num];
        require(nC.key.length>0, "Key does not exists");
        return true;
    }
    ///@notice allow user to add evidence 
    /// @param case_num Unique case ID;  @param user address of requestor; ///@param CID from IPFS; ///@param AES key used for AONT 
    function add_evidence(uint case_num, address user, string memory CID) public returns (string memory) {
        bytes32 KC = keccak256(abi.encodePacked(CID));
        SCase storage nC = active_cases[case_num];
        nC.UnassignedEvidences[CID] = 1;
        nC.evid += 1;
        // nC.evCID[KC]=CID;
        emit Evidence_Registered("User", user,  "registered evidence", KC);
        return CID;
    }

    ///@notice return level of integrity assigned to an evidence
    ///@param key unique identifier of evidence
    function return_level(
        uint case_num,
        string memory key
    ) public view returns (uint) {
        // require(does_case_exists(case_num) == true, "Case does not exists");
        // require(
        //     does_evidence_exists(case_num, key) == true,
        //     "Evidence does not exists"
        // );
        // require(is_level_assigned(case_num, key) == true, "Evidence not valid");
        if(does_case_exists(case_num) == true && does_evidence_exists(case_num, key) == true && is_level_assigned(case_num, key) == true){
            SCase storage nc = active_cases[case_num];
            uint lvl = nc.AssignedEvidences[key];
            return lvl;
        }
        return 0;
    }

//     ///@notice allows deletion of evidence
//     function delete_evidence(bytes32 key, uint case_num) internal {
//         SCase storage nc = active_cases[case_num];
//         require(does_case_exists(case_num) == true, "Case does not exists");
//         require(
//             is_closed(case_num) == 1,
//             "Case is still open. Cannot delete evidence"
//         );
//         require(
//             does_evidence_exists(case_num, key) == true,
//             "Evidence does not exists"
//         );
//         require(is_level_assigned(case_num, key) == true, "Evidence not valid");
//         nc.AssignedEvidences[key] = 0;
//         emit EvidenceDeleted(
//             "Evidence from Case has been deleted",
//             case_num,
//             key
//         );
//     }

//     ///@notice closes a case
//     function case_closing(uint case_num) internal {
//         require(
//             returnRole(msg.sender) == 1,
//             "Only Head Investigator can create cases"
//         );
//         SCase storage nc = active_cases[case_num];
//         require(
//             nc.HI == msg.sender,
//             "Only Head Investigator of the case can close it."
//         );
//         nc.closetime = block.timestamp;
//         emit CaseClosed("Case is closed", case_num);
//     }

//     function is_closed(uint case_num) internal view returns (uint) {
//         SCase storage nc = active_cases[case_num];
//         if (nc.closetime == 0) {
//             return 0;
//         }
//         return 1;
//     }
}
