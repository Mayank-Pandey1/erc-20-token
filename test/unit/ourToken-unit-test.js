const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const chai = require("chai");
const eventemitter2 = require("chai-eventemitter2");
chai.use(eventemitter2());
const {
    developmentChains,
    INITIAL_SUPPLY,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("OurToken", function () {
          const multiplier = 10 ** 18;
          let ourToken, deployer, user1;
          beforeEach(async function () {
              const accounts = await getNamedAccounts(); //specifying which account we want connected to our deployed fundMe contract since we will be making transactions
              //while testing
              deployer = accounts.deployer;
              user1 = accounts.user1;

              await deployments.fixture("all"); //using fixture we can deploy our contracts with as many tags as we want
              //running all the deploy scripts using this line
              ourToken = await ethers.getContract(
                  "OurTokenOpenzeppelin",
                  deployer
              );
          });

          it("token contract was deployed", async () => {
              assert(ourToken.address);
          });

          describe("constructor", function () {
              it("has some correct supply of initial tokens", async function () {
                  const initialSupply = await ourToken.totalSupply();
                  assert.equal(initialSupply.toString(), INITIAL_SUPPLY);
              });

              it("token has some name", async function () {
                  const tokenName = (await ourToken.name()).toString();
                  assert.equal("MyToken", tokenName);
              });

              it("token has a symbol", async function () {
                  const tokenSymbol = (await ourToken.symbol()).toString();
                  assert.equal("MTK", tokenSymbol);
              });
          });

          describe("transfers", () => {
              it("transfers tokens to a user(address) successfully", async () => {
                  const tokensToTransfer = ethers.utils.parseEther("10");
                  await ourToken.transfer(user1, tokensToTransfer);
                  expect(await ourToken.balanceOf(user1)).to.equal(
                      tokensToTransfer
                  );
              });
              it("emits a transfer event when the transfer occurs", async () => {
                  await expect(
                      ourToken.transfer(user1, (10 * multiplier).toString())
                  ).to.emit(ourToken, "Transfer");
              });
          });

          describe("allowances", () => {
              const amount = (20 * multiplier).toString();
              beforeEach(async () => {
                  playerToken = await ethers.getContract(
                      "OurTokenOpenzeppelin",
                      user1
                  );
              });

              it("Should approve other address to spend tokens and then transfer", async () => {
                  const tokensToSpend = ethers.utils.parseEther("5");
                  //Deployer is approving that user1 can spend 5 MTK's
                  await ourToken.approve(user1, tokensToSpend);
                  await playerToken.transferFrom(
                      deployer,
                      user1,
                      tokensToSpend
                  );
                  expect(await playerToken.balanceOf(user1)).to.equal(
                      tokensToSpend
                  );
              });

              it("doesn't allow an unapproved member to do transfers", async () => {
                  await expect(
                      playerToken.transferFrom(deployer, user1, amount)
                  ).to.be.revertedWith("ERC20: insufficient allowance");
              });

              it("emits an approval event, when approval occurs", async () => {
                  await expect(ourToken.approve(user1, amount)).to.emit(
                      ourToken,
                      "Approval"
                  );
              });

              it("the allowance being set is accurate", async () => {
                  await ourToken.approve(user1, amount);
                  const allowance = await ourToken.allowance(deployer, user1);
                  assert.equal(allowance.toString(), amount);
              });

              it("won't allow a user to go over the allowance", async () => {
                  await ourToken.approve(user1, amount);
                  await expect(
                      playerToken.transferFrom(
                          deployer,
                          user1,
                          (40 * multiplier).toString()
                      )
                  ).to.be.revertedWith("ERC20: insufficient allowance");
              });
          });
      });
