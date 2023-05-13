import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import {TOKEN_PROGRAM_ID, createMint, getMint} from "@solana/spl-token"
import wallet from "../dev-wallet.json"

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

const connection = new Connection("https://api.devnet.solana.com");

const payer = keypair;
const mintAuthority = keypair;
const freezeAuthority = keypair;

async function create() {
    try {
        const tokenMint =  await createMint(
            connection,
            payer,
            mintAuthority.publicKey,
            freezeAuthority.publicKey,
            6
        )
        console.log ( `Mint ID: ${tokenMint.toBase58()}`)
        console.log(`Success! Check out your TX here: 
        https://explorer.solana.com/tx/${tokenMint}?cluster=devnet`);
        
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
}

async function findToken() {
    const find = await getMint(
        connection,
        new PublicKey("B7MmiKMeaPmeXvLD1TLvZeLVqMEzTyrqq54fSk1HCRBC")
    )
    console.log(find.address)
}
 

// create();
findToken()