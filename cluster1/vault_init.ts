import { Connection, Keypair, SystemProgram, PublicKey } from "@solana/web3.js"
import { Program, Wallet, AnchorProvider, Address } from "@project-serum/anchor"
import { WbaVault, IDL } from "../programs/wbaVault";
import wallet from "../dev-wallet.json"

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Create a devnet connection
const connection = new Connection("https://api.devnet.solana.com");

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), { commitment: "confirmed"});

// Create our program
const program = new Program<WbaVault>(IDL, "D51uEDHLbWAxNfodfQDv7qkp8WZtxrhi3uganGbNos7o" as Address, provider);

const vaultInit = Keypair.generate()
console.log(`You've generated wallet: ${vaultInit.publicKey.toBase58()}`)
console.log(`Secret Key: ${vaultInit.secretKey.toLocaleString()}`)

// Create vault auth PDA
const vault_auth_seeds = [Buffer.from("auth"), vaultInit.publicKey.toBuffer()];
const vault_auth = PublicKey.findProgramAddressSync(vault_auth_seeds, program.programId)[0];
console.log(`vault_auth_seeds: ${vault_auth_seeds.toLocaleString}`)
console.log(`vault_auth: ${vault_auth.toBase58()}`)

// Create vault system program PDA
const vault_seeds = [Buffer.from("vault"), vault_auth.toBuffer()];
const vault = PublicKey.findProgramAddressSync(vault_seeds, program.programId)[0];


// Execute our enrollment transaction
(async () => {
    try {
        const txhash = await program.methods
        .initialize()
        .accounts({
            owner: keypair.publicKey,
            vaultState: vaultInit.publicKey,
            vaultAuth: vault_auth,
            vault: vault,
            systemProgram: SystemProgram.programId,
        })
        .signers([
            keypair,
            vaultInit,
        ]).rpc();
        console.log(`Success! Check out your TX here: 
        https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();