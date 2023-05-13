import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import {TOKEN_PROGRAM_ID,AccountLayout, createMint, getMint, getOrCreateAssociatedTokenAccount, mintTo} from "@solana/spl-token"
import wallet from "../dev-wallet.json"

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

const commitment: Commitment = "confirmed"
const connection = new Connection("https://api.devnet.solana.com", commitment);

const payer = keypair;
const mintAuthority = keypair;
const freezeAuthority = keypair;
const mint = new PublicKey("B7MmiKMeaPmeXvLD1TLvZeLVqMEzTyrqq54fSk1HCRBC");
const tokenAcc = new PublicKey("7AqowzKdZnwVs2wckatv5GVjDwLdUTgXhUBfdXvPWQqH")

async function tokenAccount() {
    try {
        const tokenMint =  await getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            mint,
            freezeAuthority.publicKey,
        )
        console.log ( `Mint ID: ${tokenMint.address.toBase58()}`)
        
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
}

async function minter (){
    try {
    const gg = await mintTo (
        connection,
        payer,
        mint,
        tokenAcc,
        payer.publicKey,
        1000000000000
    )
    // console.log ( `Mint ID: ${minter.toBase58()}`)
    console.log(`Success! Check out your TX here: 
    https://explorer.solana.com/tx/${gg}?cluster=devnet`);
    console.log (`${gg}`)
} catch(e) {
    console.error(`Oops, something went wrong: ${e}`)
}
}

async function findToken() {
    const find = await getMint(
        connection,
        new PublicKey("B7MmiKMeaPmeXvLD1TLvZeLVqMEzTyrqq54fSk1HCRBC")
    )
    console.log(find.supply)
}

async function getAllTokens() {
    const tokenAccounts = await connection.getTokenAccountsByOwner(
        new PublicKey('B7MmiKMeaPmeXvLD1TLvZeLVqMEzTyrqq54fSk1HCRBC'),
        {
          programId: TOKEN_PROGRAM_ID,
        }
      );
    
      console.log("Token                                         Balance");
      console.log("------------------------------------------------------------");
      tokenAccounts.value.forEach((tokenAccount) => {
        const accountData = AccountLayout.decode(tokenAccount.account.data);
        console.log(`${new PublicKey(accountData.mint)}   ${accountData.amount}`);
      })
}
 

// create();
// tokenAccount()
minter()
// findToken()
// getAllTokens()