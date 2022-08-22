# A Prediction Market on Polygon
Created for the Polygon 2022 Summer Hackathon. Submitted in the DeFi category.<br>
Web app: [https://p2ppredict.xyz](https://p2ppredict.xyz)<br>
DevPost submission: [https://devpost.com/software/p2ppredict-prediction-market](https://devpost.com/software/p2ppredict-prediction-market)<br>
PredictionMarket.sol: https://polygonscan.com/address/0x8d1829F4be94EF37c2423622b725c88f528fD390 <br>
Exchange.sol: https://polygonscan.com/address/0x0ada172BE483d891F512ee1b0ff03711215BC254 <br>

### /frontend <br>
Typescript Next.js app. Nothing special.

### /contracts <br>
All the smart contract code, foundry is used as dev environment. Tests can be found at /src/test and simple scripts can be found at /scripts. The contracts are documented with natspec, so if you want a closer look it's better that you check them out directly, instead of them being explained here. <br>

There is no backend, everything is either on the frontend or on a smart contract (Exchange.sol or PredictionMarket.sol).
# Project Details Required by DevPost 

## Inspiration
The main inspiration was seeing people taking bets with each other on twitter, with regards to future prices of tokens. The most famous example was when the twitter user Algod and the Luna creator Do Kwon made a bet against each other about the price of Luna [https://www.theblock.co/post/137687/terraform-labs-do-kwon-bets-1-million-on-lunas-future-price](https://www.theblock.co/post/137687/terraform-labs-do-kwon-bets-1-million-on-lunas-future-price). To do this, they needed to trust a human to escrow the money. This is pretty embarrasing for the crypto industry, as making bets against each other in an autonomous peer-to-peer way was one of the absolute first use-cases that were brought up years ago. Because of this, it was obvious to me that an exchange were people can make bets such as the one above, WITHOUT a single trusted party that decides the outcome, was necessary. Essentially, the only ingredients necessary are smart contracts together with oracles (chainlink price feeds).

## What it does
As a user you can create a market or buy a side of market that someone else has created. Three example scenarios are:
1. You are bullish/bearish an asset and thinks it going to be over/under a certain price at a certain date.
2. You are bearish a stablecoin and think that it will depeg.
3. You are market neutral and wanna create a market and sell BOTH sides of it

We take example 1 above, and create a market that resolves 1 day after the anticipated ethereum Merge (expected to occur on september 15th). Firstly, some parameters needs to be chosen:
- Strike Price: $2000 (the price ETH needs to hit for you to win)
- Expiry: 2022-09-16 (the end date)
- Position Size: 1000 MATIC (the payout)
	- Underlying collateral for a market is always in the native token. We are on Polygon PoS, so that is MATIC.
- Over Odds: 10.00 which is the same as 10% (your side)
	- The price is currently ~$1500 for $ETH, so a 10% chance of it reaching $2000 in ~1 month might be reasonable
- Under Odds: 1.111... which is the same as 90% (your opponent's side)

**NOTE**: Over Odds + Under Odds = 100% always because the smart contract currently take 0 fees.

You create the market, and what happens in the background is:
1. From your input, the web client will generate a SVG and pin it on IPFS. (https://github.com/holma91/p2ppredict/blob/main/frontend/utils/ipfs.ts)
2. Two ERC721 tokens gets created, one representing the UNDER SIDE, and one representing the OVER SIDE. Here is how the OVER SIDE looks on OpenSea (this prediction has 5 MATIC as collateral instead of 1000 as in our example): https://opensea.io/assets/matic/0x8d1829F4be94EF37c2423622b725c88f528fD390/124
3. Since you chose the OVER SIDE when creating the market, the UNDER SIDE will automatically get listed on the p2ppredict exchange. You can also list on OpenSea as well, if you want to.

**Under Price** = Position Size / Under Odds = 1000 / 1.111... = 900 MATIC
Which means that the UNDER SIDE is now listed for 900 MATIC on the exchange. Someone buys the UNDER SIDE for 900 MATIC which means that you'll receive 900 MATIC, making the input for your bet:

**Your stake** = Position Size - List Price = 1000 MATIC - 900 MATIC = 100 MATIC 

And your opponents stake is of course 900 MATIC (what they payed for the UNDER SIDE). This table explains what will happen on September 16th (the day after the Merge):

| **ETH Price**                                                                   | **Winner**                    | **Payout**                                                                                                                                                  | 
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| `$ETH is above $2000 ->`| You                                    | 100 MATIC * 10.00 = 1000 MATIC                                                                                                              |
| `$ETH is below $2000 ->`| Not You                                  | 900 MATIC * 1.111... = 1000 MATIC                                                                                                               |

So to summarize, if you win you'll get 1000 MATIC and your stake is only 100 MATIC, which makes sense since 100 * 10.00 = 1000 and your odds was 10.00! When the expiry date is here, you just go the page that's showing you your open positions and click exercise. That will trigger a function in the prediction market contract, and that function will:
1. Check that we are at expiry
2. Query the chainlink price feed contract for ETH/USD and determine if the UNDER or OVER side won
3. Pay the winner

And that's is how a market works on p2ppredict from creation to being exercised!

## How we built it
There are two major smart contract, 
- Exchange.sol (https://github.com/holma91/p2ppredict/blob/main/contracts/src/Exchange.sol)
	- Responsible for the trading on the platform.
- PredictionMarket.sol (https://github.com/holma91/p2ppredict/blob/main/contracts/src/PredictionMarket.sol)
	- Where markets get created and exercised. Is also an extension of ERC721.

The frontend is built with Typescript and React (https://github.com/holma91/p2ppredict/tree/main/frontend).

Everything is 100% on-chain for this version, but a more gas-efficient version might utilize a normal off-chain backend for some non-crucial operations as well. 

## Challenges we ran into

We wanted the web app to be easily browsable for users that are not connected with their wallet, which was a little tedious to do at first, but we later found the wallet kit from https://rainbow.me/ which made it much easier. Another challenge was how to do math in solidity with fractions and percentages (since there are no floats). After learning a little bit of fixed point math, it got easier.

## Accomplishments that we're proud of
In general, I think it's cool that it's possible for anyone to both be a market maker, and a taker on p2ppredict. And the fact that you don't need a trusted third party to escrow the funds when making a bet with another person, is in my opinion objectively useful. 

More specifically, I'm proud with how the UI turned out. I think it looks kind of good!

## What we learned
Everything that's necessary for a market to exist for ANY arbitrary asset is
- a price feed
- participants on both sides of the trade

This is pretty cool, because what it means is that we will probably see more and more derivatives in DeFi. 

## What's next for p2ppredict - Prediction Market
-  Keep working on the UI and the general UX of the website
-  Optimize the contracts to consume less gas. 
-  Get support for more markets.
-  Make it possible to have whatever ERC20-token you want as collateral for a position, not just the native token.
-  Change the predictions from being ERC721s to ERC1155s, so that every position can have multiple shares.
