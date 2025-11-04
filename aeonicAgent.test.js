const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AeonicAgent", function () {
  it("solo el guardian puede autocorregir", async function () {
    const [owner, other] = await ethers.getSigners();
    const Aeonic = await ethers.getContractFactory("AeonicAgent", owner);
    const cid0 = "bafybeihjoka5g4y2wsxeiuovygcewlcsj6aw72l7wow3ik5gxdsz6vz5xq";
    const agent = await Aeonic.deploy(owner.address, cid0);
    await agent.waitForDeployment();

    await expect(agent.connect(other).executeAutocorrection(90, cid0))
      .to.be.revertedWith("Aeonic: not guardian");

    await expect(agent.connect(owner).executeAutocorrection(70, cid0))
      .to.be.revertedWith("Aeonic: integrity too low");

    const cid1 = "bafkreib767c73l6bz3hndri6nn2ngkabkd6yqaqoups5bdhitf4tmvgq3m";
    await agent.connect(owner).executeAutocorrection(95, cid1);

    expect(await agent.currentGeneticHash()).to.eq(cid1);
    expect(await agent.lastIntegrityScore()).to.eq(95n);
  });
});