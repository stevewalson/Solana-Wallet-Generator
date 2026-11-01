# <img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/solana-colored.svg" alt="Solana" title="Solana" width="36" height="36" /> Solana Wallet Generator

A lightweight, secure, offline self-hosted web utility built with **Vite** and **Node.js** to generate standalone 24-word BIP39 Solana cryptocurrency wallets and export recovery credentials a **password-protected ZIP archive**.

## Technical Overview

* **Seed Generation:** Utilizes `bip39` to generate secure 256-bit entropy mnemonic phrases resulting in a standard 24-word recovery seed.
* **Key Derivation:** Derives cryptographic keypairs using standard Solana derivation paths (`m/44'/501'/0'/0'`) via `ed25519-hd-key` and `@solana/web3.js`.
* **AES-256 Encryption:** Integrates `@zip.js/zip.js` to encrypt the exported wallet file using robust AES-256 encryption.
* **Client-Side Execution:** All cryptographic operations run strictly within the browser sandbox with zero backend communication, external API calls, or telemetry.

For maximum security, run this tool on an offline (air-gapped) machine or disconnect your network before generating a wallet.
---

## Prerequisites

Ensure you have the following installed on your local machine:
* [Node.js](https://nodejs.org/) (v18+ recommended)
* Git

---

## Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/stevewalson/Solana-Wallet-Generator.git # or download the ZIP file directly
   cd Solana-Wallet-Generator

2. **Install dependencies:**
   ```bash
   npm install

3. **Start the local development server:**
   ```bash
   npm run dev

4. **Access the application:**
Open the local development URL provided in your terminal (typically http://localhost:5173).