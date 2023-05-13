import { Commitment, Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js"
import wallet from "../dev-wallet.json"
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Define our Mint address
const mint = new PublicKey("B7MmiKMeaPmeXvLD1TLvZeLVqMEzTyrqq54fSk1HCRBC");

// Add the Token Metadata Program
const token_metadata_program_id = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

// Create PDA for token metadata
const metadata_seeds = [
    Buffer.from('metadata'),
    token_metadata_program_id.toBuffer(),
    mint.toBuffer(),
];
const [metadata_pda, _bump] = PublicKey.findProgramAddressSync(metadata_seeds, token_metadata_program_id);

(async () => {
    try {
        // Start here
        let tx = new Transaction().add (
            createCreateMetadataAccountV3Instruction({
                metadata: metadata_pda,
                mint: mint,
                mintAuthority: keypair.publicKey,
                payer: keypair.publicKey,
                updateAuthority: keypair.publicKey,
            },
            {
                createMetadataAccountArgsV3: {
                    data: {
                        name: "First WBA coin",
                        symbol: "WBA",
                        uri: "",
                        sellerFeeBasisPoints: 100,
                        creators: [
                            {address: keypair.publicKey, verified: true, share: 100}
                        ],
                        // primarySaleHappend: false,
                        collection: null,
                        uses: null,
                    },
                    isMutable: true,
                    collectionDetails: null
                }
            })
        );

        let txhash = await sendAndConfirmTransaction(connection, tx, [keypair])
        console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();