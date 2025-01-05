// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// TODO:
// 1、创建一个收款的函数
// 2、记录每个投资人投资的值
// 3、在锁定期内，达到众筹目标值，众筹发起者可以提款
// 4、在锁定期内，没有达到目标值，投资人在锁定期结束后可以发起退款

contract FundMe {
    mapping(address => uint256) public fundAddressToAmount;
    address public immutable owner;
    uint256 public immutable lockTime;
    uint256 public immutable deployTimestamp;
    uint256 constant TARGET = 3 * 1e15;
    /** fund的最少数量 */
    uint256 constant MINI_VALUE = 1 * 1e15;

    constructor(uint256 _lockTime) {
        owner = msg.sender;
        lockTime = _lockTime;
        // 从block中获取部署的时间戳
        deployTimestamp = block.timestamp;
    }

    function fund() public payable fundOpen {
        require(msg.value >= MINI_VALUE, "you should fund 1 Finney at least");
        fundAddressToAmount[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner fundClosed {
        // 获取余额 address(this).balance
        require(
            address(this).balance >= TARGET,
            "The target value was not reached"
        );
        // 提款  把钱都转给owner
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "withdraw failed");
        fundAddressToAmount[msg.sender] = 0;
    }

    /** 退款 */
    function refund() public fundClosed {
        require(
            address(this).balance < TARGET,
            "The target value was reached, you can't refund"
        );
        require(fundAddressToAmount[msg.sender] != 0, "you have no fund");
        // 退款
        (bool success, ) = msg.sender.call{
            value: fundAddressToAmount[msg.sender]
        }("");
        require(success, "refund failed");
        // 退款成功清空
        fundAddressToAmount[msg.sender] = 0;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner can call this function");
        _;
    }

    modifier fundClosed() {
        require(
            block.timestamp >= deployTimestamp + lockTime,
            "fund is open, you can't call this function"
        );
        _;
    }

    modifier fundOpen() {
        require(
            block.timestamp < deployTimestamp + lockTime,
            "fund is closed, you can't call this function"
        );
        _;
    }
}
