import { request, gql } from "graphql-request";

export const getUserMarkets = async (user: string) => {
  try {
    const query = gql`
      query getUserMarkets {
        user(id: "${user}") {
          id
          totalNoBought
          totalNoSold
          totalReceived
          totalSpent
          totalRewards
          totalYesBought
    userAddress
    totalYesSold
    marketsParticipated {
      id
      noInMarket
      yesInMarket
      rewards
      spent
      market {
        id
        marketContract
        question
        resolved
        totalNo
        totalPriceToken
        totalStaked
        totalYes
        won
      }
    }
  }
}`;
    const data: any = await request(
      "https://api.studio.thegraph.com/query/73364/radish/version/latest",
      query
    );
    console.log(data.user);
    return data.user;
  } catch (error) {
    console.log(error);
  }
};
