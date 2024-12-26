const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Prediction Market System", function () {
  async function deployContractsFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    // Deploy tokens first
    const PriceToken = await ethers.getContractFactory("MockERC20");
    const priceToken = await PriceToken.deploy("Price Token", "PT");

    const YesToken = await ethers.getContractFactory("YesToken");
    const yesToken = await YesToken.deploy(owner.address);

    const NoToken = await ethers.getContractFactory("NoToken");
    const noToken = await NoToken.deploy(owner.address);

    // Deploy factory
    const MarketFactory = await ethers.getContractFactory("RadishCore");
    const marketFactory = await MarketFactory.deploy(
      await priceToken.getAddress(),
      await yesToken.getAddress(),
      await noToken.getAddress()
    );

    // Create a test market
    const question = "Will BTC reach $150k in 2024?";
    const endTime = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now

    await marketFactory.createMarket(question, endTime);

    // Get the created market's address from events
    const filter = marketFactory.filters.MarketCreated();
    const events = await marketFactory.queryFilter(filter);
    const marketAddress = events[0].args.marketContract;

    // Get market contract instance
    const PredictionMarket = await ethers.getContractFactory(
      "PredictionMarket"
    );
    const market = PredictionMarket.attach(marketAddress);

    // Mint some price tokens for testing
    const mintAmount = ethers.parseEther("1000");
    await priceToken.mint(user1.address, mintAmount);
    await priceToken.mint(user2.address, mintAmount);

    return {
      marketFactory,
      market,
      priceToken,
      yesToken,
      noToken,
      owner,
      user1,
      user2,
      question,
      endTime,
    };
  }

  describe("Market Factory", function () {
    it("Should deploy factory with correct initial state", async function () {
      const { marketFactory, priceToken, yesToken, noToken } =
        await loadFixture(deployContractsFixture);

      expect(await marketFactory.marketCount()).to.equal(1n);
      expect(await marketFactory.priceToken()).to.equal(
        await priceToken.getAddress()
      );
      expect(await marketFactory.yesToken()).to.equal(
        await yesToken.getAddress()
      );
      expect(await marketFactory.noToken()).to.equal(
        await noToken.getAddress()
      );
    });

    it("Should create new markets correctly", async function () {
      const { marketFactory, question, endTime } = await loadFixture(
        deployContractsFixture
      );

      const currentCount = await marketFactory.marketCount();
      const tx = await marketFactory.createMarket(
        "New Question",
        endTime + 1000
      );
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === "MarketCreated"
      );
      expect(event).to.not.be.undefined;
      expect(event.args[0]).to.equal(currentCount + 1n);
      expect(event.args[1]).to.equal("New Question");
      expect(event.args[2]).to.equal(BigInt(endTime + 1000));
      expect(event.args[3]).to.match(/^0x[a-fA-F0-9]{40}$/);

      expect(await marketFactory.marketCount()).to.equal(currentCount + 1n);
    });
  });

  describe("Prediction Market", function () {
    describe("Market State", function () {
      it("Should initialize with correct state", async function () {
        const { market, question, endTime } = await loadFixture(
          deployContractsFixture
        );

        const state = await market.getMarketState();
        expect(state.question).to.equal(question);
        expect(state.endTime).to.equal(BigInt(endTime));
        expect(state.totalStaked).to.equal(0n);
        expect(state.resolved).to.be.false;
      });
    });

    describe("Token Operations", function () {
      it("Should allow buying YES tokens", async function () {
        const { market, priceToken, user1 } = await loadFixture(
          deployContractsFixture
        );

        const amount = ethers.parseEther("10");
        await priceToken
          .connect(user1)
          .approve(market.getAddress(), ethers.parseEther("1000"));

        await expect(market.connect(user1).buy(true, amount))
          .to.emit(market, "TokensPurchased")
          .withArgs(user1.address, 1n, amount);

        const [, yesBalance] = await market.getBalances(user1.address);
        expect(yesBalance).to.equal(amount);
      });

      it("Should allow buying NO tokens", async function () {
        const { market, priceToken, user1 } = await loadFixture(
          deployContractsFixture
        );

        const amount = ethers.parseEther("10");
        await priceToken
          .connect(user1)
          .approve(market.getAddress(), ethers.parseEther("1000"));

        await expect(market.connect(user1).buy(false, amount))
          .to.emit(market, "TokensPurchased")
          .withArgs(user1.address, 2n, amount);

        const [, , noBalance] = await market.getBalances(user1.address);
        expect(noBalance).to.equal(amount);
      });

      it("Should calculate correct token prices", async function () {
        const { market, priceToken, user1 } = await loadFixture(
          deployContractsFixture
        );

        const amount = ethers.parseEther("10");
        await priceToken
          .connect(user1)
          .approve(market.getAddress(), ethers.parseEther("1000"));

        // Buy some YES tokens to change the price
        await market.connect(user1).buy(true, amount);

        const yesPrice = await market.getTokenPrice(true);
        const noPrice = await market.getTokenPrice(false);

        // Convert to numbers for easier comparison
        const yesPriceNum = Number(yesPrice) / 1e18;
        const noPriceNum = Number(noPrice) / 1e18;

        // Prices should sum to approximately 1
        expect(yesPriceNum + noPriceNum).to.be.closeTo(1, 0.0001);
      });
    });

    describe("Market Resolution", function () {
      it("Should allow voting with tokens", async function () {
        const { market, priceToken, user1 } = await loadFixture(
          deployContractsFixture
        );

        const amount = ethers.parseEther("10");
        await priceToken
          .connect(user1)
          .approve(market.getAddress(), ethers.parseEther("1000"));

        // Buy and vote with YES tokens
        await market.connect(user1).buy(true, amount);
        await market.connect(user1).vote(true, amount);

        const state = await market.getMarketState();
        expect(state.totalYes).to.equal(amount);
      });

      it("Should resolve market correctly", async function () {
        const { market, priceToken, user1, user2 } = await loadFixture(
          deployContractsFixture
        );

        const amount = ethers.parseEther("10");
        const halfAmount = amount / 2n;

        await priceToken
          .connect(user1)
          .approve(market.getAddress(), ethers.parseEther("1000"));
        await priceToken
          .connect(user2)
          .approve(market.getAddress(), ethers.parseEther("1000"));

        // User1 votes YES
        await market.connect(user1).buy(true, amount);
        await market.connect(user1).vote(true, amount);

        // User2 votes NO with less amount
        await market.connect(user2).buy(false, halfAmount);
        await market.connect(user2).vote(false, halfAmount);

        await market.resolve();

        const state = await market.getMarketState();
        expect(state.resolved).to.be.true;
        expect(state.won).to.be.true; // YES should win as it has more votes
      });
    });
  });
});
