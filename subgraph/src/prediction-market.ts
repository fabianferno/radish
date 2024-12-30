import { BigInt, log } from "@graphprotocol/graph-ts";
import {
  MarketResolved as MarketResolvedEvent,
  LiquidityAdded as LiquidityAddedEvent,
  EmergencyLiquidityAdded as EmergencyLiquidityAddedEvent,
  RewardClaimed as RewardClaimedEvent,
  TokenOperation as TokenOperationEvent,
} from "../generated/templates/PredictionMarket/PredictionMarket";
import { Market, Order, User, UserMarket } from "../generated/schema";

export function handleMarketResolved(event: MarketResolvedEvent): void {
  let entity = Market.load(event.params.marketId.toString());
  if (entity != null) {
    entity.resolved = true;
    entity.won = event.params.result;
    entity.totalPriceToken = event.params.totalPriceToken;
    entity.save();
  }
}

export function handleLiquidityAdded(event: LiquidityAddedEvent): void {
  let entity = Market.load(event.params.marketId.toString());
  if (entity != null) {
    entity.totalStaked = entity.totalStaked.plus(event.params.amount);
    entity.save();
  }
}

export function handleEmergencyLiquidityAdded(
  event: EmergencyLiquidityAddedEvent
): void {
  let entity = Market.load(event.params.marketId.toString());
  if (entity != null) {
    entity.totalStaked = entity.totalStaked.plus(event.params.amount);
    entity.save();
  }
}

export function handleRewardClaimed(event: RewardClaimedEvent): void {
  let user = User.load(event.params.user);
  let userMarket = UserMarket.load(
    event.params.user.toString() + "-" + event.params.marketId.toString()
  );

  if (user && userMarket) {
    userMarket.rewards = userMarket.rewards.plus(event.params.rewardAmount);
    userMarket.save();
    user.totalRewards = user.totalRewards.plus(event.params.rewardAmount);
    user.save();
  }
}

export function handleTokenOperation(event: TokenOperationEvent): void {
  let market = Market.load(event.params.marketId.toString());
  let user = User.load(event.params.user);
  if (user == null) {
    log.info("New User", [event.params.user.toString()]);
    user = new User(event.params.user);
    user.userAddress = event.params.user;
    user.totalYesBought = BigInt.fromI32(0);
    user.totalYesSold = BigInt.fromI32(0);
    user.totalNoBought = BigInt.fromI32(0);
    user.totalNoSold = BigInt.fromI32(0);
    user.totalSpent = BigInt.fromI32(0);
    user.totalReceived = BigInt.fromI32(0);
    user.totalRewards = BigInt.fromI32(0);
    user.save();
  }
  if (market == null) {
    log.info("NO MARKET ,{} ", [event.params.marketId.toString()]);
  }
  if (market) {
    log.info("Token Operation", [
      event.params.user.toString(),
      event.params.marketId.toString(),
      event.params.tokenType.toString(),
      event.params.opType.toString(),
      event.params.amount.toString(),
    ]);
    let userMarket = UserMarket.load(
      event.params.user.toString() + "-" + event.params.marketId.toString()
    );
    if (userMarket == null) {
      log.info("New User Market", [
        event.params.user.toString(),
        event.params.marketId.toString(),
      ]);
      userMarket = new UserMarket(
        event.params.user.toString() + "-" + event.params.marketId.toString()
      );
      userMarket.user = event.params.user;
      userMarket.market = event.params.marketId.toString();
      userMarket.yesBought = BigInt.fromI32(0);
      userMarket.noBought = BigInt.fromI32(0);
      userMarket.yesSold = BigInt.fromI32(0);
      userMarket.noSold = BigInt.fromI32(0);
      userMarket.spent = BigInt.fromI32(0);
      userMarket.yesInMarket = BigInt.fromI32(0);
      userMarket.noInMarket = BigInt.fromI32(0);
      userMarket.rewards = BigInt.fromI32(0);
      userMarket.save();
    }
    // Buying Token
    if (event.params.opType == 1) {
      // Buying Yes
      if (event.params.tokenType == 1) {
        market.totalYes = market.totalYes.plus(event.params.amount);
        user.totalYesBought = user.totalYesBought.plus(event.params.amount);
        userMarket.yesBought = userMarket.yesBought.plus(event.params.amount);
        userMarket.yesInMarket = userMarket.yesInMarket.plus(
          event.params.amount
        );
        userMarket.spent = userMarket.spent.plus(event.params.cost);

        let order = new Order(event.transaction.hash.toHexString());
        order.market = event.params.marketId.toString();
        order.user = event.params.user;
        order.amount = event.params.amount;
        order.price = event.params.cost;
        order.type = "Buy";
        order.tokenType = "Yes";
        order.timestamp = event.block.timestamp;
        order.save();
        userMarket.save();
        market.save();
        user.save();
      }
      // Buying No
      else if (event.params.tokenType == 2) {
        market.totalNo = market.totalNo.plus(event.params.amount);
        user.totalNoBought = user.totalNoBought.plus(event.params.amount);
        userMarket.noBought = userMarket.noBought.plus(event.params.amount);
        userMarket.noInMarket = userMarket.noInMarket.plus(event.params.amount);
        userMarket.spent = userMarket.spent.plus(event.params.cost);
        let order = new Order(event.transaction.hash.toHexString());
        order.market = event.params.marketId.toString();
        order.user = event.params.user;
        order.amount = event.params.amount;
        order.price = event.params.cost;
        order.type = "Buy";
        order.tokenType = "No";
        order.timestamp = event.block.timestamp;
        order.save();
        userMarket.save();
        market.save();
        user.save();
      }
      // Selling Token
    } else if (event.params.opType == 2) {
      // Selling Yes
      if (event.params.tokenType == 1) {
        market.totalYes = market.totalYes.minus(event.params.amount);
        user.totalYesSold = user.totalYesSold.plus(event.params.amount);
        userMarket.yesSold = userMarket.yesSold.plus(event.params.amount);
        userMarket.spent = userMarket.spent.minus(event.params.cost);
        let order = new Order(event.transaction.hash.toHexString());
        order.market = event.params.marketId.toString();
        order.user = event.params.user;
        order.amount = event.params.amount;
        order.price = event.params.cost;
        order.type = "Sell";
        order.tokenType = "Yes";
        order.timestamp = event.block.timestamp;
        order.save();
        userMarket.save();
        market.save();
        user.save();
      }
      // Selling No
      else if (event.params.tokenType == 2) {
        market.totalNo = market.totalNo.minus(event.params.amount);
        user.totalNoSold = user.totalNoSold.plus(event.params.amount);
        userMarket.noSold = userMarket.noSold.plus(event.params.amount);
        userMarket.spent = userMarket.spent.minus(event.params.cost);
        let order = new Order(event.transaction.hash.toHexString());
        order.market = event.params.marketId.toString();
        order.user = event.params.user;
        order.amount = event.params.amount;
        order.price = event.params.cost;
        order.type = "Sell";
        order.tokenType = "No";
        order.timestamp = event.block.timestamp;
        order.save();
        userMarket.save();
        market.save();
        user.save();
      }
    }
  }
}
