<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [bitburner](./bitburner.md) &gt; [TIX](./bitburner.tix.md) &gt; [getPosition](./bitburner.tix.getposition.md)

## TIX.getPosition() method

Returns the player’s position in a stock.

**Signature:**

```typescript
getPosition(sym: string): [number, number, number, number];
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  sym | string | Stock symbol. |

**Returns:**

\[number, number, number, number\]

Array of four elements that represents the player’s position in a stock.

## Remarks

RAM cost: 2 GB Returns an array of four elements that represents the player’s position in a stock.

The first element is the returned array is the number of shares the player owns of the stock in the Long position. The second element in the array is the average price of the player’s shares in the Long position.

The third element in the array is the number of shares the player owns of the stock in the Short position. The fourth element in the array is the average price of the player’s Short position.

All elements in the returned array are numeric.

## Example 1


```ts
// NS1
var pos = stock.getPosition("ECP");
var shares      = pos[0];
var avgPx       = pos[1];
var sharesShort = pos[2];
var avgPxShort  = pos[3];
```

## Example 2


```ts
// NS2
const [shares, avgPx, sharesShort, avgPxShort] = ns.stock.getPosition("ECP");
```

