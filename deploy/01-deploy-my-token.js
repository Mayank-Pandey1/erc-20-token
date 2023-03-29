//main function
// calling of main function

const { network } = require("hardhat");
const {
    INITIAL_SUPPLY,
    developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments; //getting variables from deployments object
    const { deployer } = await getNamedAccounts();

    const ourToken = await deploy("OurTokenOpenzeppelin", {
        from: deployer,
        args: [INITIAL_SUPPLY],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log(`Token contract is deployed at: ${ourToken.address}`);

    if (
        !developmentChains.includes(
            network.name && process.env.ETHERSCAN_API_KEY
        )
    ) {
        await verify(ourToken.address, [INITIAL_SUPPLY]);
    }
};

module.exports.tags = ["all", "ourToken"];
