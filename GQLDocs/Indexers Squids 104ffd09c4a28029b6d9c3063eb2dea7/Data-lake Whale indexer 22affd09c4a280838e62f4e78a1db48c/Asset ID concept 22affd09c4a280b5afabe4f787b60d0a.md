# Asset ID concept

Data-lake indexer tracks all existing assets which are register in Asset Registry. However AAVE part has assets which are not registered in Asset Registry but they are still must be indexed. For now it’s Debt tokens. 

To keep data consistent, Asset entity has separate fields to represent Asset DB entity primary key and asset’s Asset Registry ID. 

So:

- `id` - *[ required, numeric value or h160 hex address ]* - db entity primary key
- `assetRegistryId` - *[ nullable, numeric value ]* - Asset Registry ID

## ID value generation concept

To get asset ID we are using custom built multi-location relatively to Hydration parachain. 

For assets which are registered in AssetRegistry pallet and have following asset type:

- `Token`
- `Bond`
- `External`
- `*StableSwap*`
- `*XYK*`
- `*PoolShare*`

 multilocation looks like this:

```jsx
   {
      parents: 0
      interior: {
        X1: [
          {
            GeneralIndex: <asset_registry_id>
          }
        ]
      }
    }
```

For asset type `Erc20` multilocation looks like this:

```jsx
   {
      parents: 0
      interior: {
        X1: {
          AccountKey20: {
            network: null
            key: <asset_smart_contract_address>
          }
        }
      }
    }
```

To create Asset ID as primary key we are using `interior/X1/GeneralIndex` or `interior/X1/AccountKey20/key` value. As result primary key can be either numeric value or h160 address. 

In case of Debt token, which is not registered in AssetRegistry pallet, it still has contract address and multilocation. As result Debt token can be easily saved in DB with unified primary key. However, Debt tokens won’t have value in `assetRegistryId` field.