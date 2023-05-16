import { Connection, Keypair, SystemProgram, PublicKey } from "@solana/web3.js"
import { Program, Wallet, AnchorProvider, Address, BN } from "@project-serum/anchor"
import { WbaVault, IDL } from "../programs/wbaVault";
import wallet from "../dev-wallet.json"
import { TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Create a devnet connection
const connection = new Connection("https://api.devnet.solana.com");

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), { commitment: "confirmed"});

// Create our program
const program = new Program<WbaVault>(IDL, "D51uEDHLbWAxNfodfQDv7qkp8WZtxrhi3uganGbNos7o" as Address, provider);

const mintAccountPublicKey = new PublicKey("B7MmiKMeaPmeXvLD1TLvZeLVqMEzTyrqq54fSk1HCRBC");

const vaultInit = new PublicKey ("HwCMXeNTweFNUhBXtNUvwAwPG9DbGTKY1epCXB7TEjuw")

const ownerTokenAccount = new PublicKey ("7AqowzKdZnwVs2wckatv5GVjDwLdUTgXhUBfdXvPWQqH")

// Create vault auth PDA
const vault_auth_seeds = [Buffer.from("auth"), vaultInit.toBuffer()];
const vault_auth = PublicKey.findProgramAddressSync(vault_auth_seeds, program.programId)[0];
console.log(`vault_auth_seeds: ${vault_auth_seeds.toString()}`)
console.log(`vault_auth: ${vault_auth.toBase58()}`)

// Create vault system program PDA
const vault_seeds = [Buffer.from("vault"), vault_auth.toBuffer()];
const vault = PublicKey.findProgramAddressSync(vault_seeds, program.programId)[0];

// Execute our enrollment transaction
(async () => {
    try {
        //Token Account of Vault 
        const vaultTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mintAccountPublicKey,
            vault_auth,
            true
        );
        
        const txhash = await program.methods
        .depositSpl(new BN(10000000))
        .accounts({
            owner: keypair.publicKey,
            vaultState: vaultInit,
            vaultAuth: vault_auth,
            systemProgram: SystemProgram.programId,
            ownerAta: ownerTokenAccount,
            vaultAta: vaultTokenAccount.address,
            tokenProgram: TOKEN_PROGRAM_ID,
            tokenMint: mintAccountPublicKey,
        })
        .signers([
            keypair,
        ]).rpc();
        console.log(`Success! Check out your TX here: 
        https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();