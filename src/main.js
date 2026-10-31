import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { Keypair } from '@solana/web3.js';

let currentWalletData = null;

const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const outputSection = document.getElementById('output');
const seedPhraseEl = document.getElementById('seedPhrase');
const publicKeyEl = document.getElementById('publicKey');
const secretKeyEl = document.getElementById('secretKey');

generateBtn.addEventListener('click', async () => {
  // Generate 256 bits of entropy -> 24 words phrase
  const mnemonic = bip39.generateMnemonic(256);
  
  // Convert mnemonic to seed buffer
  const seed = await bip39.mnemonicToSeed(mnemonic);
  
  // Standard Solana derivation path (Phantom / Solflare)
  const path = "m/44'/501'/0'/0'";
  const derivedSeed = derivePath(path, seed.toString('hex')).key;
  
  // Create Keypair from derived seed
  const keypair = Keypair.fromSeed(derivedSeed);

  currentWalletData = {
    mnemonic,
    publicKey: keypair.publicKey.toBase58(),
    secretKey: Array.from(keypair.secretKey),
    derivationPath: path,
  };

  renderWallet(currentWalletData);
});

function renderWallet(data) {
  outputSection.classList.remove('hidden');

  // Format 24-word grid
  const words = data.mnemonic.split(' ');
  seedPhraseEl.innerHTML = words
    .map((word, index) => `<div class="word-item">${index + 1}. <span>${word}</span></div>`)
    .join('');

  publicKeyEl.textContent = data.publicKey;
  secretKeyEl.textContent = JSON.stringify(data.secretKey);
}

downloadBtn.addEventListener('click', () => {
  if (!currentWalletData) return;

  const fileContent = `==================================================
SOLANA WALLET RECOVERY FILE
==================================================

24-WORD SEED PHRASE:
${currentWalletData.mnemonic}

PUBLIC KEY (ADDRESS):
${currentWalletData.publicKey}

DERIVATION PATH:
${currentWalletData.derivationPath}

SECRET KEY (BYTE ARRAY):
${JSON.stringify(currentWalletData.secretKey)}

==================================================
WARNING: KEEP THIS FILE OFFLINE AND SECURE.
==================================================`;

  const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `solana-wallet-${currentWalletData.publicKey.slice(0, 8)}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});