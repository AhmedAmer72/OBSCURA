/** Activity module — uses Obscura API — run: npx tsx examples/activity.ts [wallet] */
import { ObscuraSDK } from "@obscura-fhe/sdk";

const sdk = ObscuraSDK.create({
  apiUrl: process.env.OBSCURA_API_URL,
});

const wallet = (process.argv[2] ?? "0xf76e6B0920e9332fF4410f6dD53F01722AbC71a3") as `0x${string}`;

const { items } = await sdk.activity.listForWallet(wallet, { pageSize: 10 });
console.log(`Activity rows: ${items.length}`);
items.forEach((r) => console.log(r.event_name, r.tx_hash?.slice(0, 12)));
