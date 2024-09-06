import {
  Blaze,
  Blockfrost,
  Core,
  HotWallet,
  Maestro,
} from "@blaze-cardano/sdk";
import fs from "node:fs/promises";

export async function getBlazeB(): Promise<
  [Blaze<Blockfrost, HotWallet>, string, Core.Ed25519KeyHashHex]
> {
  const seed = await fs.readFile("./seed.txt", "ascii");
  const blockFrostProjectId = await fs.readFile("./token.txt", "ascii");
  const entropy = Core.mnemonicToEntropy(seed, Core.wordlist);
  const masterkey = Core.Bip32PrivateKey.fromBip39Entropy(
    Buffer.from(entropy),
    "",
  );
  const pubKey = await masterkey.toPublic();
  const addr = Core.addressFromBech32(
    "addr_test1qr02lf68hu4n4t5wdgfkn0ddql36z8jr060ytc4e0gscy57qc3u5cmx09wr5wkwngx5gvrmjppaatgdqj5c8v3q406sszrxkn6",
  );
  const kk = Core.Ed25519KeyHashHex(addr.asBase().getPaymentCredential().hash);
  const pubkeyHex = pubKey.hex();
  const networkId = Core.NetworkId.Testnet;
  const provider = new Blockfrost({
    network: "cardano-preprod",
    projectId: blockFrostProjectId,
  });
  const wallet = await HotWallet.fromMasterkey(
    masterkey.hex(),
    provider,
    networkId,
  );
  const blaze = await Blaze.from(provider, wallet);
  return [blaze, pubkeyHex, kk];
}

export async function getBlaze(): Promise<
  [Blaze<Maestro, HotWallet>, string, Core.Ed25519KeyHashHex]
> {
  const seed = await fs.readFile("./seed.txt", "ascii");
  const apiKey = await fs.readFile("./maestro.key", "ascii");
  const entropy = Core.mnemonicToEntropy(seed, Core.wordlist);
  const masterkey = Core.Bip32PrivateKey.fromBip39Entropy(
    Buffer.from(entropy),
    "",
  );
  const pubKey = await masterkey.toPublic();
  const addr = Core.addressFromBech32(
    "addr_test1qr02lf68hu4n4t5wdgfkn0ddql36z8jr060ytc4e0gscy57qc3u5cmx09wr5wkwngx5gvrmjppaatgdqj5c8v3q406sszrxkn6",
  );
  const kk = Core.Ed25519KeyHashHex(addr.asBase().getPaymentCredential().hash);
  const pubkeyHex = pubKey.hex();
  const networkId = Core.NetworkId.Testnet;
  const provider = new Maestro({
    network: "preprod",
    apiKey: "osMxy0Zueq15NkxIucOQppmHKC4FX8vI",
  });
  const wallet = await HotWallet.fromMasterkey(
    masterkey.hex(),
    provider,
    networkId,
  );
  const blaze = await Blaze.from(provider, wallet);
  return [blaze, pubkeyHex, kk];
}
