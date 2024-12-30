import {
  MarketCreated as MarketCreatedEvent,
  OwnershipTransferred as OwnershipTransferredEvent
} from "../generated/RadishCore/RadishCore"
import { MarketCreated, OwnershipTransferred } from "../generated/schema"

export function handleMarketCreated(event: MarketCreatedEvent): void {
  let entity = new MarketCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.RadishCore_id = event.params.id
  entity.question = event.params.question
  entity.endTime = event.params.endTime
  entity.marketContract = event.params.marketContract
  entity.priceToken = event.params.priceToken
  entity.yesToken = event.params.yesToken
  entity.noToken = event.params.noToken

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
