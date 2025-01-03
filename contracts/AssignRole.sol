// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

///@title role assignment to user
contract AssignRole {
    mapping(address => uint)  public Roles;  
    mapping(address => uint) public RegisteredUsers;
    address[] public users;
    event User_Registration_Done(string, address, uint);
    ///@notice returns level of integrity based on role of user
    function getLevel(string calldata designation) internal pure returns (uint) {
        if(keccak256(abi.encodePacked(designation)) == keccak256(abi.encodePacked("Head Investigator"))) return 1;
        else if (keccak256(abi.encodePacked(designation)) == keccak256(abi.encodePacked("Lead Investigator"))) return 4;
        else if (keccak256(abi.encodePacked(designation)) == keccak256(abi.encodePacked("Team Investigator")))return 7;
        return 0;}
    ///@notice checks if user is already existing
    function DoesUserExists(address user) public view returns (bool) {
        return (RegisteredUsers[user] == 1);
    }
    ///@notice allows an user to create account and set role
    function setRole(string calldata designation) public {
        require(DoesUserExists(msg.sender) == false, "User Already Registered");
        require(getLevel(designation) > 0, "Invalid designation");
        Roles[msg.sender] = getLevel(designation);
        RegisteredUsers[msg.sender] = 1;
        users.push(msg.sender);
        emit User_Registration_Done(" User Registration Completed",msg.sender,Roles[msg.sender]);
    }

    ///@notice returns role of an user 
    function returnRole(address user) public view returns (uint) {
        require(DoesUserExists(user) == true, "User is not registered");
        return Roles[user];
    }
    function publicDoesUserExists(address user) public view returns (bool) {
        bool ans = DoesUserExists(user);
        return (ans);
    }
}
