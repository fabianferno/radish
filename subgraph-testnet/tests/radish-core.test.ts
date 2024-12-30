import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { MarketCreated } from "../generated/schema"
import { MarketCreated as MarketCreatedEvent } from "../generated/RadishCore/RadishCore"
import { handleMarketCreated } from "../src/radish-core"
import { createMarketCreatedEvent } from "./radish-core-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let id = BigInt.fromI32(234)
    let question = "Example string value"
    let endTime = BigInt.fromI32(234)
    let marketContract = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let priceToken = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let yesToken = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let noToken = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newMarketCreatedEvent = createMarketCreatedEvent(
      id,
      question,
      endTime,
      marketContract,
      priceToken,
      yesToken,
      noToken
    )
    handleMarketCreated(newMarketCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("MarketCreated created and stored", () => {
    assert.entityCount("MarketCreated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "MarketCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "question",
      "Example string value"
    )
    assert.fieldEquals(
      "MarketCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "endTime",
      "234"
    )
    assert.fieldEquals(
      "MarketCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "marketContract",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "MarketCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "priceToken",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "MarketCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "yesToken",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "MarketCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "noToken",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
