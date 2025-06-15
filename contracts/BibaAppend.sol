// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./Case.sol";
///@title allows additional information/supporting material to be added to an existing evidence
/// also takes care of evidence being read by users
contract BibaAppend is Case {
    mapping(string => mapping(uint => string)) private AppendedEvidence; 
    mapping(string => uint) private TrackerMapping; 
    
    event Append_Allowed(string, address, string,bytes32);
    event Read_Allowed(string, address, string, bytes32); 
    
    function returnTimes(string memory key) private view returns (uint) {
        return TrackerMapping[key];
    }
    ///@notice checks if user is allowed to append to an existing evidence anf if yes, then append is completed 
    function append_allowed(string memory key,uint case_num) public view returns (bool){
        if(is_authorized(msg.sender, case_num) == false){
            return false;
        }
        uint L = return_level(case_num, key);
        uint R = returnRole(msg.sender);
        return R>=L;
    }
    /// @notice creates link between og evidence and supporting mat 
    function tracker(string memory cid, string memory key) public payable{
        uint times = returnTimes(key); 
        uint ntime = times + 1;
        TrackerMapping[key] = ntime; 
        AppendedEvidence[key][ntime] = cid;
        bytes32 KC = keccak256(abi.encodePacked(key));
        emit Append_Allowed("User", msg.sender,"can append to evidence",KC);
    }
    
    ///@notice checks if user is authorised to read evidence and if yes then allows user to read evidence and event is logged
    function read_allowed(
        string memory key,
        uint case_num
    ) public returns (bool) {
        require(
            is_authorized(msg.sender, case_num) == true,
            "Cannot interact with this evidence"
        );
        require(
            is_level_assigned(case_num, key) == true,
            "Evidence cannot be interacted with , it has not been assigned a level"
        );
        uint L = return_level(case_num, key);
        uint R = returnRole(msg.sender);
        require(R<=L, "User is not authorized to read evidence");
        bytes32 KC = keccak256(abi.encodePacked(key));
        emit Read_Allowed("User",msg.sender, "has read evidence",  KC);
        return R<=L;
    }
}
