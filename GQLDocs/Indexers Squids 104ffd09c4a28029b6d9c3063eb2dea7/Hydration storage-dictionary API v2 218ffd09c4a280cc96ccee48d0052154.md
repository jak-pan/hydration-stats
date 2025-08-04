# Hydration storage-dictionary API v2

# Endpoints:

- LBP pools - `https://galacticcouncil.squids.live/hydration-storage-dictionary:lbppool-v2/api/graphql`
- XYK pools - `https://galacticcouncil.squids.live/hydration-storage-dictionary:xykpool-v2/api/graphql`
- Stableswaps - `https://galacticcouncil.squids.live/hydration-storage-dictionary:stablepool-v2/api/graphql`
- Omnipool and assets - `https://galacticcouncil.squids.live/hydration-storage-dictionary:omnipool-v2/api/graphql`
- Generic data - Assets, EMA Oracles, Aavepools -`https://galacticcouncil.squids.live/hydration-storage-dictionary:generic-data-v2/api/graphql`

# Collected data

### Minified Data Structures

To optimise storage space usage, some JSON values are minified. 

Currently supported following minified types :

```graphql
        type MinifiedDataStructure {
          t: MinifiedDataStructureTypeName!
          d: [String!]!
        }
        
        enum MinifiedDataStructureTypeName {
          AccountBalances
          AssetDynamicFee
          OmnipoolAssetState
        }
```

Instead of storing full JSON, storage dictionary transforms JSON to tuples with additional field to determine minified data type.

Decoding rules are provided below:

- **AccountBalances**

```tsx
type AccountBalances {
	free: String!
	reserved: String!
	miscFrozen: String
	feeFrozen: String
	frozen: String
	flags: String
}   
 
== >

{
	t: "AccountBalances"
	d: [free, reserved, miscFrozen, feeFrozen, frozen, flags]
}
```

- **OmnipoolAssetState**

```tsx
type OmnipoolAssetState {
	hubReserve: String!
	shares: String!
	protocolShares: String!
	cap: String!
	tradable: Tradability
}

== >

{
	t: "OmnipoolAssetState"
	d: [hubReserve, shares, protocolShares, cap, tradable]
}
```

- **AssetDynamicFee**

```tsx
type AssetDynamicFee {
	assetFee: Int!
	protocolFee: Int!
	timestamp: Int!
}

== >

{
	t: "AssetDynamicFee"
	d: [assetFee, protocolFee, timestamp]
}
```

### Full view

API v2 processes storage data per block (fetches storage values per each block) but persists processed results only if this data is different regarding previously saved block. 

It means that XYK pools dictionary can contain snapshots for specific pool for blocks `7_000_000`, `7_000_001`, `7_000_004` where blocks `7_000_002` and `7_000_003` are avoided as pool's state in these blocks is the same as at block `7_000_001`.

This approach of persisting data only on change allows us dramatically reduce DB size and processing speed without loosing value of dictionary.

Main drawback of this approach is a bit complicated and heavier API queries. To get data at specific block, you need to use filter `lessThanOrEqualTo` instead of `equalTo.` If you need get data for blocks range, so some logic for interpolation of data must be used on data consumer side.

If interpolation is not acceptable in your case, check `Compressed view` .

### Compressed view

To have full history of storage states in case data interpolation is not acceptable or queries speed is critical, dictionaries collects states per each block in compressed form. 

Compressed data reduces block data snapshot size to about 6 - 7 times what drastically reduces DB and API responses latency.

Drawbacks are clear:

- compression and decompression needs compute resources and as result time.
- you can not filter data by specific entities but only by block and get all block’s snapshot at once. It means data transport redundancy.

But on practice, these drawbacks are much less meaning than response latency problem.

**Main logic of compressed block data is following** 

Indexer collects all storage states at block *(what particular dictionary is responsible for)*, adds all created entities to decorated JSON, compresses this JSON and saves this data as base64 string. You can look to this as to snapshot of indexed block within whole dictionary.

### Compressed data

Decorated JSON looks like this:

```tsx
type BlockCompressedDataJson = {
  lbppool: Lbppool[]
  lbppoolAssetsData: LbppoolAssetsData[];
  xykpool: Xykpool[];
  xykpoolAssetsData: XykpoolAssetsData[];
  stableswap: Stableswap[];
  stableswapAssetData: StableswapAssetData[]
  omnipool: Omnipool[];
  omnipoolAssetData: OmnipoolAssetData[];
  aavepool: Aavepool[];
  emaOracle: EmaOracle[];
  assetHistoricalData: AssetHistoricalData[];
}
```

E.g. if it’s XYK pool dictionary, all fields except `xykpool` and `xykpoolAssetsData` will be empty arrays. This small redundancy with empty fields is left for consistency of decompressed data.

**Important:** if entity has relationship with some other entity, only `id` of nested entity will be included to compressed data. E.g. `AssethistoricalData`  has relationship with `Asset` entity. 

Compressed data will like following:

```tsx
{
      id: '1000445-7300000',
      asset: { id: '1000445' },
      totalIssuance: '15600000000',
      existentialDeposit: '1',
      dynamicFee: null,
      paraBlockHeight: 7300000
    }
```

Where field `asset` doesn’t contain all fields of nested `Asset` entity but just an `id`. With this you can make additional query to dictionary API and get full `Asset` entity.

### **Query**

Each dictionary has query - `blockCompressedData` :

```graphql
type BlockCompressedData {
  "block_number"
  id: ID!
  algo: String!
  compStrFormat: String!
  data: String!
  paraBlockHeight: Int!
}
```

Response example:

```graphql
        {
          "id": "3934550",
          "algo": "gzip",
          "compStrFormat": "base64",
          "data": "H4sIAAAAAA...GRlRzNAAAA",
          "paraBlockHeight": 3934550
        }
```

### Decompression

Current implementation uses `GZIP` compression and saved compressed result as `base64` string. Each `BlockCompressedData` entity contains required metadata you can use to identify correct method for decompression (`algo` and `compStrFormat`).

Here is compression/decompression logic implementation to have more view how it’s done on indexer side:

```tsx
import pako from 'pako';

export class PakoManager {
  static uint8ArrayToBase64(array: Uint8Array) {
    return Buffer.from(array).toString('base64');
  }

  static base64ToUint8Array(base64: string) {
    return Uint8Array.from(Buffer.from(base64, 'base64'));
  }

  static compress({
    payload,
    stringifyPayload = true,
  }: {
    payload: any;
    stringifyPayload?: boolean;
  }) {
    try {
      return this.uint8ArrayToBase64(
        pako.gzip(stringifyPayload ? JSON.stringify(payload) : payload, {
          level: 8,
        })
      );
    } catch (e) {
      console.log(e);
    }
  }

  static decompress(data: string, parse = true) {
    try {
      const decomprResult = pako.ungzip(this.base64ToUint8Array(data), {
        to: 'string',
      });

      return !parse ? decomprResult : JSON.parse(decomprResult);
    } catch (e) {
      console.log(e);
    }
    return undefined;
  }
}

```