import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  MarketCreated,
  OwnershipTransferred
} from "../generated/RadishCore/RadishCore"

export function createMarketCreatedEvent(
  id: BigInt,
  question: string,
  endTime: BigInt,
  marketContract: Address,
  priceToken: Address,
  yesToken: Address,
  noToken: Address
): MarketCreated {
  let marketCreatedEvent = changetype<MarketCreated>(newMockEvent())

  marketCreatedEvent.parameters = new Array()

  marketCreatedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam("question", ethereum.Value.fromString(question))
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "endTime",
      ethereum.Value.fromUnsignedBigInt(endTime)
    )
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "marketContract",
      ethereum.Value.fromAddress(marketContract)
    )
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "priceToken",
      ethereum.Value.fromAddress(priceToken)
    )
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam("yesToken", ethereum.Value.fromAddress(yesToken))
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam("noToken", ethereum.Value.fromAddress(noToken))
  )

  return marketCreatedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}
