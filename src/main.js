import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { Keypair } from '@solana/web3.js';
import * as zip from '@zip.js/zip.js';

let currentWalletData = null;

const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const generatePwdBtn = document.getElementById('generatePwdBtn');
const toggleVisibilityBtn = document.getElementById('toggleVisibilityBtn');
const outputSection = document.getElementById('output');
const seedPhraseEl = document.getElementById('seedPhrase');
const publicKeyEl = document.getElementById('publicKey');
const secretKeyEl = document.getElementById('secretKey');
const zipPasswordInput = document.getElementById('zipPassword');

const critLength = document.getElementById('critLength');
const critUpper = document.getElementById('critUpper');
const critLower = document.getElementById('critLower');
const critNumber = document.getElementById('critNumber');
const critSpecial = document.getElementById('critSpecial');

generateBtn.addEventListener('click', async () => {
  const mnemonic = bip39.generateMnemonic(256);
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const path = "m/44'/501'/0'/0'";
  const derivedSeed = derivePath(path, seed.toString('hex')).key;
  const keypair = Keypair.fromSeed(derivedSeed);

  currentWalletData = {
    mnemonic,
    publicKey: keypair.publicKey.toBase58(),
    secretKey: Array.from(keypair.secretKey),
    derivationPath: path,
  };

  zipPasswordInput.value = '';
  validatePassword('');
  renderWallet(currentWalletData);
});

function renderWallet(data) {
  outputSection.classList.remove('hidden');

  const words = data.mnemonic.split(' ');
  seedPhraseEl.innerHTML = words
    .map((word, index) => `<div class="word-item">${index + 1}. <span>${word}</span></div>`)
    .join('');

  publicKeyEl.textContent = data.publicKey;
  secretKeyEl.textContent = JSON.stringify(data.secretKey);
}

function validatePassword(pwd) {
  const isLen = pwd.length >= 12;
  const isUp = /[A-Z]/.test(pwd);
  const isLow = /[a-z]/.test(pwd);
  const isNum = /[0-9]/.test(pwd);
  const isSpec = /[\W_]/.test(pwd);

  critLength.classList.toggle('valid', isLen);
  critUpper.classList.toggle('valid', isUp);
  critLower.classList.toggle('valid', isLow);
  critNumber.classList.toggle('valid', isNum);
  critSpecial.classList.toggle('valid', isSpec);

  const isValidAll = isLen && isUp && isLow && isNum && isSpec;
  downloadBtn.disabled = !isValidAll;
}

zipPasswordInput.addEventListener('input', (e) => {
  validatePassword(e.target.value);
});

toggleVisibilityBtn.addEventListener('click', () => {
  const isPassword = zipPasswordInput.type === 'password';
  zipPasswordInput.type = isPassword ? 'text' : 'password';
  toggleVisibilityBtn.textContent = isPassword ? 'Hide' : 'Show';
});

generatePwdBtn.addEventListener('click', () => {
  const length = 16;
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const all = lower + upper + numbers + special;

  let pwd = '';
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += numbers[Math.floor(Math.random() * numbers.length)];
  pwd += special[Math.floor(Math.random() * special.length)];

  for (let i = pwd.length; i < length; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }

  const shuffledPwd = pwd.split('').sort(() => Math.random() - 0.5).join('');
  zipPasswordInput.value = shuffledPwd;


  zipPasswordInput.type = 'text';
  toggleVisibilityBtn.textContent = 'Hide';

  validatePassword(shuffledPwd);
});

downloadBtn.addEventListener('click', async () => {
  if (!currentWalletData || downloadBtn.disabled) return;

  const password = zipPasswordInput.value;

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

  try {
    const blobWriter = new zip.BlobWriter('application/zip');
    const zipWriter = new zip.ZipWriter(blobWriter);

    await zipWriter.add('solana-wallet.txt', new zip.TextReader(fileContent), {
      password: password,
      encryptionMethod: zip.ENCRYPTION_METHOD_AES_256,
    });

    const zipBlob = await zipWriter.close();

    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `solana-wallet-${currentWalletData.publicKey.slice(0, 8)}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Encryption failed:', error);
    alert('Failed to generate encrypted zip file.');
  }
});