const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Prediction Market System", function () {
  const overrides = {
    gasLimit: 8000000,
  };

  async function deployContractsFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    // Deploy tokens first
    const PriceToken = await ethers.getContractFactory("MockERC20");
    const priceToken = await PriceToken.deploy("Price Token", "PT", overrides);

    // Deploy token contracts with owner as initial owner
    const YesToken = await ethers.getContractFactory("YesToken");
    const yesToken = await YesToken.deploy(owner.address, overrides);

    const NoToken = await ethers.getContractFactory("NoToken");
    const noToken = await NoToken.deploy(owner.address, overrides);

    // Deploy factory
    const MarketFactory = await ethers.getContractFactory("RadishCore");
    const marketFactory = await MarketFactory.deploy(
      await priceToken.getAddress(),
      await yesToken.getAddress(),
      await noToken.getAddress(),
      overrides
    );

    // Transfer ownership of token contracts to the factory
    await yesToken.transferOwnership(
      await marketFactory.getAddress(),
      overrides
    );
    await noToken.transferOwnership(
      await marketFactory.getAddress(),
      overrides
    );

    // Create a test market
    const question = "Will BTC reach $150k in 2024?";
    const endTime = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now

    await marketFactory.createMarket(question, endTime, overrides);

    // Get the created market's address from events
    const filter = marketFactory.filters.MarketCreated();
    const events = await marketFactory.queryFilter(filter);
    const marketAddress = events[0].args.marketContract;
    const marketId = events[0].args.id;

    // Get market contract instance
    const PredictionMarket = await ethers.getContractFactory(
      "PredictionMarket"
    );
    const market = PredictionMarket.attach(marketAddress);

    // Mint some price tokens for testing
    const mintAmount = ethers.parseEther("1000");
    await priceToken.mint(user1.address, mintAmount, overrides);
    await priceToken.mint(user2.address, mintAmount, overrides);

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
      marketId,
    };
  }

  describe("Token Permissions", function () {
    it("Should not allow direct minting of YES tokens", async function () {
      const { yesToken, user1, marketId } = await loadFixture(
        deployContractsFixture
      );
      const amount = ethers.parseEther("10");
      await expect(
        yesToken
          .connect(user1)
          .mint(
            user1.address,
            marketId,
            amount,
            ethers.hexlify(ethers.toUtf8Bytes(""))
          )
      ).to.be.revertedWith(
        "Only the Prediction Market contract can mint this token"
      );
    });

    it("Should not allow direct minting of NO tokens", async function () {
      const { noToken, user1, marketId } = await loadFixture(
        deployContractsFixture
      );
      const amount = ethers.parseEther("10");
      await expect(
        noToken
          .connect(user1)
          .mint(
            user1.address,
            marketId,
            amount,
            ethers.hexlify(ethers.toUtf8Bytes(""))
          )
      ).to.be.revertedWith(
        "Only the Prediction Market contract can mint this token"
      );
    });

    it("Should not allow direct burning of YES tokens", async function () {
      const { market, yesToken, priceToken, user1, marketId } =
        await loadFixture(deployContractsFixture);
      const amount = ethers.parseEther("10");

      // Buy tokens first
      await priceToken
        .connect(user1)
        .approve(await market.getAddress(), ethers.parseEther("1000"));
      await market.connect(user1).buy(true, amount);

      // Try to burn directly
      await expect(
        yesToken.connect(user1).burn(user1.address, marketId, amount)
      ).to.be.revertedWith(
        "Only the Prediction Market contract can burn this token"
      );
    });

    it("Should not allow direct burning of NO tokens", async function () {
      const { market, noToken, priceToken, user1, marketId } =
        await loadFixture(deployContractsFixture);
      const amount = ethers.parseEther("10");

      // Buy tokens first
      await priceToken
        .connect(user1)
        .approve(await market.getAddress(), ethers.parseEther("1000"));
      await market.connect(user1).buy(false, amount);

      // Try to burn directly
      await expect(
        noToken.connect(user1).burn(user1.address, marketId, amount)
      ).to.be.revertedWith(
        "Only the Prediction Market contract can burn this token"
      );
    });

    it("Should allow market contract to mint YES tokens", async function () {
      const { market, priceToken, user1 } = await loadFixture(
        deployContractsFixture
      );
      const amount = ethers.parseEther("10");

      await priceToken
        .connect(user1)
        .approve(await market.getAddress(), ethers.parseEther("1000"));

      // This internally calls the YES token mint function
      await expect(market.connect(user1).buy(true, amount)).to.not.be.reverted;
    });

    it("Should allow market contract to mint NO tokens", async function () {
      const { market, priceToken, user1 } = await loadFixture(
        deployContractsFixture
      );
      const amount = ethers.parseEther("10");

      await priceToken
        .connect(user1)
        .approve(await market.getAddress(), ethers.parseEther("1000"));

      // This internally calls the NO token mint function
      await expect(market.connect(user1).buy(false, amount)).to.not.be.reverted;
    });
  });

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
        endTime + 1000,
        overrides
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
          .approve(
            await market.getAddress(),
            ethers.parseEther("1000"),
            overrides
          );

        await expect(market.connect(user1).buy(true, amount, overrides))
          .to.emit(market, "TokenOperation")
          .withArgs(user1.address, 1, 1, amount);
      });

      it("Should allow buying NO tokens", async function () {
        const { market, priceToken, user1 } = await loadFixture(
          deployContractsFixture
        );

        const amount = ethers.parseEther("10");
        await priceToken
          .connect(user1)
          .approve(
            await market.getAddress(),
            ethers.parseEther("1000"),
            overrides
          );

        await expect(market.connect(user1).buy(false, amount, overrides))
          .to.emit(market, "TokenOperation")
          .withArgs(user1.address, 1, 2, amount);
      });

      it("Should calculate correct token prices", async function () {
        const { market, priceToken, user1 } = await loadFixture(
          deployContractsFixture
        );

        const amount = ethers.parseEther("10");
        await priceToken
          .connect(user1)
          .approve(
            await market.getAddress(),
            ethers.parseEther("1000"),
            overrides
          );

        // Buy some YES tokens to change the price
        await market.connect(user1).buy(true, amount, overrides);

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
      it("Should resolve market correctly", async function () {
        const { market, priceToken, user1, user2 } = await loadFixture(
          deployContractsFixture
        );

        const amount = ethers.parseEther("10");
        const halfAmount = amount / 2n;

        await priceToken
          .connect(user1)
          .approve(
            await market.getAddress(),
            ethers.parseEther("1000"),
            overrides
          );
        await priceToken
          .connect(user2)
          .approve(
            await market.getAddress(),
            ethers.parseEther("1000"),
            overrides
          );

        // User1 buys YES tokens
        await market.connect(user1).buy(true, amount, overrides);

        // User2 buys NO tokens with less amount
        await market.connect(user2).buy(false, halfAmount, overrides);

        // Fast forward time
        await time.increase(86401); // 24 hours + 1 second

        // Get the owner (who is also the resolver) to resolve the market
        const owner = await market.owner();
        const ownerSigner = await ethers.getSigner(owner);

        await market.connect(ownerSigner).resolve(overrides);

        const state = await market.getMarketState();
        expect(state.resolved).to.be.true;
        expect(state.won).to.be.true; // YES should win as it has more tokens
      });

      it("Should not allow non-resolver to resolve market", async function () {
        const { market, user1 } = await loadFixture(deployContractsFixture);

        // Fast forward time
        await time.increase(86401);

        // Try to resolve with non-resolver account
        await expect(
          market.connect(user1).resolve(overrides)
        ).to.be.revertedWith("Only resolver can call this function");
      });

      it("Should allow owner to change resolver", async function () {
        const { market, user1 } = await loadFixture(deployContractsFixture);
        const owner = await market.owner();
        const ownerSigner = await ethers.getSigner(owner);

        await market.connect(ownerSigner).setResolver(user1.address, overrides);
        expect(await market.resolver()).to.equal(user1.address);

        // Fast forward time
        await time.increase(86401);

        // New resolver should be able to resolve the market
        await market.connect(user1).resolve(overrides);
        const state = await market.getMarketState();
        expect(state.resolved).to.be.true;
      });
    });
  });
});
