pragma solidity ^0.5.0;

contract MultiSigWallet {
    address[] public approvers;
    uint public quorum;
    uint nextId;
    
    struct Transfer {
        uint id;
        uint amount;
        address payable to;
        uint approvals;
        bool sent;
    }
    
    mapping (uint => Transfer) transfers;
    mapping (address => mapping (uint => bool)) approvals;
    
    modifier onlyApprover() {
        bool allowed = false;
        for(uint i = 0; i < approvers.length; i++) {
            if(approvers[i] == msg.sender) {
                allowed = true;
            }
        }
        require(allowed == true, 'only approver can call this function');
        _;
    }
    
    constructor(address[] memory _approvers, uint _quorum) public payable {
        approvers = _approvers;
        quorum = _quorum;
    }

    function createTransfer(uint _amount, address payable _to) external onlyApprover {
        transfers[nextId] = Transfer(nextId, _amount, _to, 0, false);
        nextId++;
    }
    
    function sendTransfer(uint _id) external onlyApprover {
        require(transfers[_id].sent == false, 'transfer has already been completed');
        if(transfers[_id].approvals >= quorum) {
            transfers[_id].sent = true;
            address payable to = transfers[_id].to;
            uint amount = transfers[_id].amount;
            to.transfer(amount);
            return;
        }
        
        if(approvals[msg.sender][_id] == false) {
            approvals[msg.sender][_id] = true;
            transfers[_id].approvals++;
        }
        
    }
}