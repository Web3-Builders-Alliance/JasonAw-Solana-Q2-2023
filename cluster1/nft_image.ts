import { Keypair, Connection, Commitment } from "@solana/web3.js";
import wallet from "../dev-wallet.json"
import { Metaplex, keypairIdentity, bundlrStorage, toMetaplexFile } from "@metaplex-foundation/js";
import { readFile } from "fs/promises"

const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

const commitment: Commitment = "confirmed"
const connection = new Connection("https://api.devnet.solana.com", commitment);

const metaplex = Metaplex.make(connection).use(keypairIdentity(keypair)).use(bundlrStorage({
    address: "https://devnet.bundlr.network",
    providerUrl: "https://api.devnet.solana.com",
    timeout: 60000}));

async function createNFT() {
    try {
    const image = await readFile("cluster1/assets/generug.png")
    const metaplex_image = toMetaplexFile(image, "generug.png")
    const uri = await metaplex.storage().upload(metaplex_image)
    console.log(`URI = ${uri}`)
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
}

createNFT()