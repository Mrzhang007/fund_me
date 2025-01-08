// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// 1、创建一个收款的函数
// 2、记录每个投资人投资的值
// 3、在锁定期内，达到众筹目标值，众筹发起者可以提款
// 4、在锁定期内，没有达到目标值，投资人在锁定期结束后可以发起退款

contract FundMe {
    mapping(address => uint256) public fundAddressToAmount;
    address public immutable owner;
    uint256 public immutable lockTime;
    uint256 public immutable deployTimestamp;
    /** 预计fund的目标值500 usd */
    uint256 constant TARGET = 500 * 1e18;
    /** fund的最少数量 100 usd */
    uint256 constant MINI_VALUE = 100 * 1e18;
    // address constant PRICE_FEED_ADDRESS =
    //     0x694AA1769357215DE4FAC081bf1f309aDC325306;
    AggregatorV3Interface private immutable priceFeed;

    constructor(uint256 _lockTime, address priceFeedAddress) {
        owner = msg.sender;
        lockTime = _lockTime;
        // 从block中获取部署的时间戳
        deployTimestamp = block.timestamp;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable fundOpen {
        require(
            transformEth2Usd(msg.value) >= MINI_VALUE,
            "you should fund 100USD at least"
        );
        fundAddressToAmount[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner fundClosed {
        // 获取余额 address(this).balance
        require(
            transformEth2Usd(address(this).balance) >= TARGET,
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
            transformEth2Usd(address(this).balance) < TARGET,
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

    /** 获取余额 */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /** USD转ETH */
    function transformEth2Usd(
        uint256 ethAmount
    ) internal view returns (uint256) {
        // ETH Amount * (ETH / USD) = USD
        uint256 price = getLatestFeedPrices();
        // 因为ETH / USD 交易对的精度（precision）为 8位； 所以得到结果要除以10**8
        return (ethAmount * price) / 1e8;
    }

    /** 获取feed prices */
    function getLatestFeedPrices() internal view returns (uint256) {
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        // 把int256转成uint256;
        return uint256(answer);
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
