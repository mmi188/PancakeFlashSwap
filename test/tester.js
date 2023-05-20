const { expect, assert } = require("chai");
const { ethers, waffle } = require("hardhat");
const { impersonateFundErc20 } = require("../utils/utilities");

const {
  abi,
} = require("../artifacts/contracts/interfaces/IERC20.sol/IERC20.json");
const { inputToConfig } = require("@ethereum-waffle/compiler");

const provider = waffle.provider;

describe("FlashSwap Contract", () => {
  let FLASHSWAP,
    BORROW_AMOUNT,
    FUND_AMOUNT,
    initialFundingHuman,
    txArbitrage,
    gasUsedUSD;

  const DECIMALS = 18;

  //const BUSD_WHALE = "0xaac32aad65b0c271c13e284678fc1400edbbd639";
  const BUSD_WHALE = "0x28C6c06298d514Db089934071355E5743bf21d60";

  const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
  const CAKE = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82";
  const CROX = "0x2c094F5A7D1146BB93850f629501eB749f6Ed491";
  const USDT = "0x55d398326f99059fF775485246999027B3197955";

  const BASE_TOKEN_ADDRESS = BUSD;

  const tokenBase = new ethers.Contract(BASE_TOKEN_ADDRESS, abi, provider);

  beforeEach(async () => {
    // Get owner as signer
    [owner] = await ethers.getSigners();

    // Ensure that the WHALE has a balance
    const whale_balance = await provider.getBalance(BUSD_WHALE);
    expect(whale_balance).not.equal("0");

    // Deploy smart contract
    const FlashSwap = await ethers.getContractFactory("PancakeFlashSwap");
    FLASHSWAP = await FlashSwap.deploy();
    await FLASHSWAP.deployed();

    // Configure our Borrowing
    const borrowAmountHuman = "1";
    BORROW_AMOUNT = ethers.utils.parseUnits(borrowAmountHuman, DECIMALS);

    // Configure Funding - FOR TESTING ONLY
    initialFundingHuman = "2";
    FUND_AMOUNT = ethers.utils.parseUnits(initialFundingHuman, DECIMALS);

    //Fund our Contract - FOR TESTING ONLY
    // await impersonateFundErc20(
    //   tokenBase,
    //   BUSD_WHALE,
    //   FLASHSWAP.address,
    //   initialFundingHuman
    // );
  });

  describe("Arbitrage Execution", () => {
    it("ensures the contract is funded", async () => {
      const flashSwapBalance = await FLASHSWAP.getBalanceOfToken(
        BASE_TOKEN_ADDRESS
      );

      const flashSwapBalanceHuman = ethers.utils.formatUnits(
        flashSwapBalance,
        DECIMALS
      );

      expect(Number(flashSwapBalanceHuman)).equal(Number(initialFundingHuman));
    });

    it("executes the arbitrage", async () => {
      txArbitrage = await FLASHSWAP.startArbitrage(
        BASE_TOKEN_ADDRESS,
        BORROW_AMOUNT
      );

      assert(txArbitrage);

      // Print balances
      const contractBalanceBUSD = await FLASHSWAP.getBalanceOfToken(BUSD);
      const formattedBalBUSD = Number(
        ethers.utils.formatUnits(contractBalanceBUSD, DECIMALS)
      );
      console.log("Balance of BUSD: " + formattedBalBUSD);

      const contractBalanceCROX = await FLASHSWAP.getBalanceOfToken(CROX);
      const formattedBalCROX = Number(
        ethers.utils.formatUnits(contractBalanceCROX, DECIMALS)
      );
      console.log("Balance of CROX: " + formattedBalCROX);

      const contractBalanceCAKE = await FLASHSWAP.getBalanceOfToken(CAKE);
      const formattedBalCAKE = Number(
        ethers.utils.formatUnits(contractBalanceCAKE, DECIMALS)
      );
      console.log("Balance of CAKE: " + formattedBalCAKE);
    });
  });

  it("general test", async () => {
    const whale_balance = await provider.getBalance(BUSD_WHALE);
    console.log(ethers.utils.formatUnits(whale_balance.toString(), DECIMALS));
  });
});
