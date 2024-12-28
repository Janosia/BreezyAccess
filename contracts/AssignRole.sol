// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

///@title creation of user and role assignment
contract AssignRole {
    mapping(string => uint)  Levels;
    mapping(address => uint)  public Roles;  
    mapping(address => uint) public RegisteredUsers;
    address[] public users;
    event User_Registration_Done(string, address, uint);
    constructor() {
        Levels["Head Investigator"] = 1;
        Levels["Lead Investigator"] = 4;
        Levels["Team Investigator"] = 7;
    }
    ///@notice returns level of integrity based on role of user
    function getLevel(string calldata designation) internal view returns (uint) {
        return (Levels[designation]);}
    ///@notice checks if user is already existing
    function DoesUserExists(address user) internal view returns (bool) {
        return (RegisteredUsers[user] == 1);
    }
    ///@notice allows an user to create account and set role
    function setRole(string calldata designation, address user) public {
        require(DoesUserExists(user) == false, "User Already Registered");
        require(getLevel(designation) > 0, "Invalid designation");
        Roles[user] = getLevel(designation);
        RegisteredUsers[user] = 1;
        users.push(user);
        emit User_Registration_Done(" User Registration Completed",user,Roles[user]);
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
