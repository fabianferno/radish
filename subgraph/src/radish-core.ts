import { BigInt } from "@graphprotocol/graph-ts";
import { MarketCreated as MarketCreatedEvent } from "../generated/RadishCore/RadishCore";
import { Market } from "../generated/schema";

export function handleMarketCreated(event: MarketCreatedEvent): void {
  let entity = new Market(event.params.id.toString());
  entity.question = event.params.question;
  entity.endTime = event.params.endTime;
  entity.marketContract = event.params.marketContract.toString();
  entity.creator = event.transaction.from.toString();
  entity.totalStaked = BigInt.fromI32(0);
  entity.totalYes = BigInt.fromI32(0);
  entity.totalNo = BigInt.fromI32(0);
  entity.totalPriceToken = BigInt.fromI32(0);
  entity.resolved = false;
  entity.save();
}
