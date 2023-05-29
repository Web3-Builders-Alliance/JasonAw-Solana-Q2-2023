import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { WbaVault, IDL } from "../target/types/wba_vault";
import { Connection, Keypair, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert } from "console";
import { expect } from "chai";
import { TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { min } from "bn.js";

describe("wba_vault", () => {

  // const connection = new Connection("http://localhost:8899");
  const keypair = anchor.web3.Keypair.generate();
  console.log(`You've generated wallet: ${keypair.publicKey.toBase58()}`)
  console.log(`Secret Key: ${keypair.secretKey.toLocaleString()}`)

    // Configure the client to use the local cluster.
    // anchor.setProvider(anchor.AnchorProvider.env());
    // const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(keypair), { commitment: "finalized" });
    // const programId = new anchor.web3.PublicKey("E9M6Zj3yMrQ8h4f6Lw94EUxuhEFnFVJKgfQNPnpQRgYu");
    // const program = new anchor.Program<WbaVault>(IDL, programId, provider);
    const provider = anchor.AnchorProvider.env()
    const program = anchor.workspace.WbaVault as Program<WbaVault>;
    
    const vaultInit = Keypair.generate()
    console.log(`You've generated wallet VaultInit: ${vaultInit.publicKey.toBase58()}`)

    const vault_auth_seeds = [Buffer.from("auth"), vaultInit.publicKey.toBuffer()];
    const vault_auth = anchor.web3.PublicKey.findProgramAddressSync(vault_auth_seeds, program.programId)[0];
    console.log(`vault_auth: ${vault_auth.toBase58()}`)
    
    // Create vault system program PDA
    const vault_seeds = [Buffer.from("vault"), vault_auth.toBuffer()];
    const vault = anchor.web3.PublicKey.findProgramAddressSync(vault_seeds, program.programId)[0];

    let mint = null;

  it("Airdroping ",async () => {
    const txhash = await provider.connection.requestAirdrop(keypair.publicKey, 2 * LAMPORTS_PER_SOL);

    let latestBlockHash = await provider.connection.getLatestBlockhash()

    await provider.connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: txhash,
    },
    "finalized");

    console.log(`Success! Check out your TX here: 
    https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
  }),

  it("Is initialized!", async () => {
    // Add your test here.
    try {
        const txhash = await program.methods
        .initialize()
        .accounts({
            owner: keypair.publicKey,
            vaultState: vaultInit.publicKey,
            vaultAuth: vault_auth,
            vault: vault,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([
            keypair,
            vaultInit,
          ]).rpc();
          console.log(`Success! ${txhash}`);
          // let r_vault = await program.account.vaultState.fetch(vaultInit.publicKey);
          // expect(r_vault.score).to.equal(0);
        // console.log(`Success! Check out your TX here: 
        // https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
  });

  it("Deposit!", async () => {
    // Add your test here.
    try {
      const vaultBeforeBalance = await provider.connection.getBalance(vault);
        const txhash = await program.methods
        .deposit(new anchor.BN (LAMPORTS_PER_SOL*1))
        .accounts({
          owner: keypair.publicKey,
          vaultState: vaultInit.publicKey,
          vaultAuth: vault_auth,
          vault: vault,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([
            keypair,
        ]).rpc();
          console.log(`Success! ${txhash}`);
          const vaultAfterBalance = await provider.connection.getBalance(vault);

     expect(vaultAfterBalance).to.equal(
        vaultBeforeBalance + 1 * LAMPORTS_PER_SOL
    );
        // console.log(`Success! Check out your TX here: 
        // https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
  });

  it("Withdraw!", async () => {
    // Add your test here.
    try {
      const vaultBeforeBalance = await provider.connection.getBalance(vault);
        const txhash = await program.methods
        .withdraw(new anchor.BN (LAMPORTS_PER_SOL*1))
        .accounts({
          owner: keypair.publicKey,
          vaultState: vaultInit.publicKey,
          vaultAuth: vault_auth,
          vault: vault,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([
            keypair,
        ]).rpc();
          console.log(`Success! ${txhash}`);
          const vaultAfterBalance = await provider.connection.getBalance(vault);
     expect(vaultAfterBalance).to.equal(
        vaultBeforeBalance - 1 * LAMPORTS_PER_SOL
    );
        // console.log(`Success! Check out your TX here: 
        // https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
  });

  it('Create Mint', async () => {
    mint = await createMint(
      provider.connection,
      keypair,
      keypair.publicKey,
      keypair.publicKey,
      6
    );

    let ownerAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      keypair,
      mint,
      keypair.publicKey
    );

    const txSig = await mintTo(
      provider.connection,
      keypair,
      mint,
      ownerAta.address,
      keypair,
      1000000000
    );

    const tokenAccount =
      await provider.connection.getParsedTokenAccountsByOwner(
        keypair.publicKey,
        {
          mint: mint,
        }
      );

    const tokenAmount = await provider.connection.getTokenAccountBalance(
      tokenAccount.value[0].pubkey
    );

    expect('1000000000').to.equal(tokenAmount.value.amount);
  });

  it("Deposit SPL!", async () => {
    // Add your test here.
    try {
        //Token Account of Vault 
        let ownerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          keypair,
          mint,
          keypair.publicKey
        );

        const vaultTokenAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            keypair,
            mint,
            vault_auth,
            true
        );
        
        const txhash = await program.methods
        .depositSpl(new anchor.BN (LAMPORTS_PER_SOL*1))
        .accounts({
            owner: keypair.publicKey,
            vaultState: vaultInit.publicKey,
            vaultAuth: vault_auth,
            systemProgram: SystemProgram.programId,
            ownerAta: ownerTokenAccount.address,
            vaultAta: vaultTokenAccount.address,
            tokenProgram: TOKEN_PROGRAM_ID,
            tokenMint: mint,
        })
        .signers([
            keypair,
        ]).rpc();

        const tokenAccount =
      await provider.connection.getParsedTokenAccountsByOwner(vault_auth, {
        mint: mint,
      });

    const tokenAmount = await provider.connection.getTokenAccountBalance(
      tokenAccount.value[0].pubkey
    );

    expect('1000000000').to.equal(tokenAmount.value.amount);
        console.log(`Success! ${txhash}`);
        // console.log(`Success! Check out your TX here: 
        // https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
  });

  it("Withdraw SPL!", async () => {
    // Add your test here.
    try {
        //Token Account of Vault 
        const ownerTokenAccount = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          keypair,
          mint,
          keypair.publicKey
        );

        const vaultTokenAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            keypair,
            mint,
            vault_auth,
            true
        );
        
        const txhash = await program.methods
        .withdrawSpl(new anchor.BN (LAMPORTS_PER_SOL*1))
        .accounts({
            owner: keypair.publicKey,
            vaultState: vaultInit.publicKey,
            vaultAuth: vault_auth,
            ownerAta: ownerTokenAccount.address,
            vaultAta: vaultTokenAccount.address,
            tokenProgram: TOKEN_PROGRAM_ID,
            tokenMint: mint,
        })
        .signers([
            keypair,
        ]).rpc();

      //   const tokenAccount =
      //   await provider.connection.getParsedTokenAccountsByOwner(
      //     keypair.publicKey,
      //     {
      //       mint: mint,
      //     }
      //   );
  
      // const tokenAmount = await provider.connection.getTokenAccountBalance(
      //   tokenAccount.value[0].pubkey
      // );
  
      // const vaultStateAccount = await program.account.vaultAuth.fetch(
      //   vaultInit.publicKey
      // );
  
      // expect('0').to.equal(tokenAmount.value.amount);
      // expect(vaultStateAccount.score).to.equal(4);
        console.log(`Success! ${txhash}`);
        // console.log(`Success! Check out your TX here: 
        // https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
  });
});
