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

async function mintNFT() {
    try {
    const mint = await metaplex.nfts().create({
        uri: "https://arweave.net/mQvqltCPt6l8C4MlA37rRL0IVCPdZlSidPnJgbOR3wg",
        name: "RUGGER",
        symbol: "RUGR",
        creators: [
            {
              address: keypair.publicKey,
              share: 100
            }
        ],
        sellerFeeBasisPoints: 1000,
        isMutable: true
    })
    console.log(`TX = ${mint.nft.address.toBase58()}`)
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
}

mintNFT()