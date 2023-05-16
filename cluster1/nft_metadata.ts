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

async function uploadMetadata() {
    try {
    const uri = await metaplex.nfts().uploadMetadata({
        name: "FirstRug",
        symbol: "RUG",
        description: "My first RUG from generug",
        image: "https://arweave.net/Nr_mGDaDmJM3urfqKsqhoiH_0ggB4lhUS8YnhGvb24k",
        attributes: [
            {trait_type: 'Feature', value: 'Vaporwave Pink'},
            {trait_type: 'Style', value: 'Pixelated'},
            {trait_type: 'Background', value: 'Minty Green'}
        ],
        properties: {
            files: [
                {
                    type: "image/png",
                    uri: "https://arweave.net/Nr_mGDaDmJM3urfqKsqhoiH_0ggB4lhUS8YnhGvb24k",
                },
            ]
        },
        creators: [
            {
              address: keypair.publicKey.toBase58(),
              share: 100
            }
        ]
    })
    console.log(`URI = ${uri.uri}`)
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
}

uploadMetadata()