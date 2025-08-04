# STATS PAGE OVERHAUL

Current implementation and values:

[https://www.notion.so/hydradx/Omnipool-Stats-354870cc89c340a4a05b8862f73f8e5b?pvs=4](https://www.notion.so/Omnipool-Stats-354870cc89c340a4a05b8862f73f8e5b?pvs=21)

Agree on:

- [ ]  which info to add to which part
- [ ]  which info are hot and needs to be added to current implementation
- [ ]  which info/parts can be added later with redesign

### Hydration dashboard - whole platform dashboard (new):

meeting with Crane:

- TVL chart (platfromwide, and per product MM, Omnipool)
- fees - platform wide (every fee)
- liquidations - check with Max for indexer
- 

- Hydration TVL - including all AMM's (Omni+stable+xyk), funds locked in MM, value locked in staking, value locked in DCA/TWAP schedules
- POL calculation changes - add protocol staked positions on relaychain, Ethereum Gnosis multisig, treasury:
- add staked DOT on relay chain ([https://polkadot.subscan.io/account/13RSNAx31mcP5H5KYf12cP5YChq6JeD8Hi64twhhxKtHqBkg](https://polkadot.subscan.io/account/13RSNAx31mcP5H5KYf12cP5YChq6JeD8Hi64twhhxKtHqBkg) ) + staking rewards [https://polkadot.subscan.io/account/14kovW62mmGZBRvbNT1w5J7m9SQskd5JTRTLKZLpkpjmZBJ8](https://polkadot.subscan.io/account/14kovW62mmGZBRvbNT1w5J7m9SQskd5JTRTLKZLpkpjmZBJ8) 
- add balance of treasury wallet 7L53bUTBopuwFt3mKUfmkzgGLayYa1Yvn1hAg9v5UMrQzTfh
- ~~council controlled multisig~~ [https://etherscan.io/tokenholdings?a=0xc8d5a24e71EAAcf6ecB1E850c0Face14B179D3B8](https://etherscan.io/tokenholdings?a=0xc8d5a24e71EAAcf6ecB1E850c0Face14B179D3B8)
- Whole platform volumes - Omnipool+stable+XYK, do we want to put in also MM numbers?
- Total (since like…beginning?)
- 24h volume
- Fees

### Money Market Dashboard (new):

Lot of data is already on MM screens, i think just most important numbers for MM needs to be displayed here

- TVL locked in MM (same question as higher, if we want to reuse Total market size)
- Total borrows (maybe in time ? )- chart
- Total supplies (maybe in time ? ) - chart
- TVL & Net Inflows/Outflows ?
- List of available markets/assets with more detailed info?

## AMM's dashboards

### Omnipool Dashboard

We probably want to keep this, alongside POL/Treasury page, as Omnipool is still kinda our flagship product.

- Do we need to change some calculations for Omnipool itself?
- Do we still want asset details section ?
- We probably don’t need recent trades
- Total volume (from beginning…)
- 24h trading

### Isolated pools (XYK) Dashboard

- 24h volume
- Total Volume ?
- 24h fees
- Top pairs ?

### Stableswap dashboard

- 24h volume
- Total volume ?
- 24h fees

### Fees

Broader topic, how to display which fee type?

Do we want to dig deeper? Fees accumulated for LP's, protocol, stakers….?

### Treasury

Hot topic back in the days, any changes ?

### H2O Dashboard

LRNA part never made it live, lets agree which dynamics to show (or not)

https://www.figma.com/file/eqzR2azTracqA8Vv0y4GUv/%F0%9F%96%A5--Hydra-%7C-Desktop-Library?type=design&node-id=20864-164952&t=3sD6d7rv6KDJPp9A-4

### Meeting notes:

- Total platform statistics: TVL, Volume, POL, protocol revenue(not for hotfix- everything what is going to protocol HDX trading fees, half of trading fee for other assets going to portocol,liquidations, POL positions fees, than we need to calculate how much is redistributed) - how much revenue protocol did last 24 hours, staking, referrals etc - % to treasury, % to stakers, % to LP's
- number of transactions per last 24 hours ?
- Lending stats - not hot fix
- distributed rewards for everything (farms, staking, referrals…lp fees?) - AGREE ON
- XCM volume ?
- AMM - breakdown of Omnipool,stablepool, xyk, generic info about all AMM's, than info about specific amm type - volume 24h , fees? , chart maybe?
- Hollar - in future
- Asset stats (apr's, inflows/outflows, tvl for different products-borrowing and lending, numbers in LP, basically what to do with your asset…?)
- some info about farms apr?
- swap page - Market stats (on swap page) - similar to Matcha style, info about relevant/selected assets, agree on TVL
- treasury - Correct the information based on POL bit higher (so bigger numbers :) )
- price delta (maybe on asset stat?) - like coingecko has for every asset
-