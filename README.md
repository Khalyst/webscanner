# WEBSCANNER 🛡️

> **Deep Website Vulnerability Scanner & OSINT Security Audit Engine**  
> Inspired by `web-check.xyz` — automated flaw detection, AI-agnostic CISO executive threat briefings, 8 supported languages, Docker container orchestration, and instant vector-crisp PDF reports.

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](docker-compose.yml)
[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js&logoColor=white)](package.json)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](src/App.tsx)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](tsconfig.json)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?logo=tailwind-css&logoColor=white)](src/index.css)

---

## 📋 Table of Contents

- [Overview & Architecture](#-overview--architecture)
- [Key Features](#-key-features)
- [Quick Start with Docker & Docker Compose](#-quick-start-with-docker--docker-compose-recommended)
- [Download & Clone from GitHub](#-download--clone-from-github)
- [Manual Local Setup (Node.js)](#-manual-local-setup-nodejs)
- [AI-Agnostic Engine Configuration](#-ai-agnostic-engine-configuration)
- [Internationalization & Supported Languages](#-internationalization--supported-languages)
- [Downloadable Mobile Version (Android & iOS)](#-downloadable-mobile-version-android--ios-pwa)
- [REST API Reference](#-rest-api-reference)
- [Repository Structure](#-repository-structure)
- [Environment Variables Reference](#️-environment-variables-reference)
- [Security, Ethics & Responsible Disclosure](#-security-ethics--responsible-disclosure)
- [License](#-license)

---

## 🏗️ Overview & Architecture

**WEBSCANNER** performs non-intrusive, deep defensive security analysis of web endpoints. It executes multi-vector OSINT reconnaissance and evaluates web applications against modern cybersecurity best practices, OWASP guidelines, and cryptographic standards.

```
                    ┌─────────────────────────┐
                    │  Target Web URL Input   │
                    └────────────┬────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       [ Network & OSINT Probes ]       [ Web Application Probes ]
       ├── DNS Records (A/MX/TXT/SOA)   ├── HTTP Security Headers (OWASP)
       ├── SPF & DMARC Anti-Spoofing    ├── SSL/TLS Certificate Analysis
       ├── Open Ports (80/443/22/etc)   ├── Cookie Flags (Secure/HttpOnly)
       └── Server & Tech Stack ID       └── robots.txt & security.txt
                 │                               │
                 └───────────────┬───────────────┘
                                 │
                                 ▼
                 ┌───────────────────────────────┐
                 │ CVSS Score & Flaw Evaluation  │
                 └───────────────┬───────────────┘
                                 │
                                 ▼
                 ┌───────────────────────────────┐
                 │   AI-Agnostic Threat Engine   │
                 │ ┌───────────────────────────┐ │
                 │ │ Gemini │ GPT-4o │ Claude  │ │
                 │ │ Ollama │ Mistral│ Offline │ │
                 │ └───────────────────────────┘ │
                 └───────────────┬───────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       [ Interactive Dashboard ]        [ Multi-Page PDF Report ]
       ├── Severity Filters (Crit/High) ├── Executive Summary & Grade
       ├── Copyable Remediation Code    ├── Vulnerabilities Breakdown
       └── 8-Language Localization      └── Ready-to-Implement Fixes
```

---

## 🌟 Key Features

- **HTTP Security Headers Matrix**: Evaluates OWASP-recommended headers (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `COOP`, `COEP`, `CORP`) with PASS/WARN/FAIL status and server configuration snippets (`Nginx`, `Apache`, `Express`, `Cloudflare`).
- **TLS / SSL Cryptographic Audit**: Live socket probing of SSL/TLS certificates, expiry days countdown, cipher strength, protocol version (`TLSv1.3`, `TLSv1.2`), and Subject Alternative Names (SANs).
- **DNS & Email Anti-Spoofing Audit**: Complete resolution of A, AAAA, MX, TXT, NS, CNAME, and SOA records; automated analysis of SPF qualifiers (`-all`, `~all`, `+all`) and DMARC enforcement policies (`reject`, `quarantine`, `none`).
- **Server & Tech Stack Fingerprinting**: Discovers underlying web servers (Nginx, Apache, Caddy), backend languages, CMS systems (WordPress, Drupal, Shopify), and flags version disclosure vulnerabilities with mapped CVE advisories.
- **Port & Network Service Reconnaissance**: Non-destructive socket checks across key management and database ports (`80`, `443`, `8080`, `8443`, `22` SSH, `21` FTP, `3306` MySQL, `5432` PostgreSQL).
- **Sensitive Files & Crawling Audit**: Analyzes `robots.txt` for exposed administrative routes, validates RFC 9116 `security.txt` compliance, and probes for exposed configuration dotfiles (`.git/HEAD`, `.env`).
- **Algorithmic CVSS Scoring & Grade**: Computes an algorithmic 0–100 security posture score and assigns an actionable letter grade (`A+` to `F`).
- **Multilingual Support (8 Languages)**: Fully localized interface in English, Spanish (Español), French (Français), German (Deutsch), Japanese (日本語), Simplified Chinese (简体中文), Portuguese (Português), and Arabic (العربية with native RTL bidirectional layout).
- **Downloadable Mobile App (PWA & Offline)**: Install WEBSCANNER on your smartphone (Android & iPhone) with 1-click install, native app launcher icon, standalone full-screen window, and offline caching powered by Service Workers.
- **AI-Agnostic Intelligence Engine**: Choose the AI of your choice on the fly! Seamlessly supports **Google Gemini**, **OpenAI (GPT-4o)**, **Anthropic Claude (Claude 3.5 Sonnet)**, **Ollama (Self-Hosted/Local)**, **Mistral AI**, or the **Native Deterministic Rule Engine** (100% offline, zero external dependencies).
- **Exportable PDF Audit Reports**: Generates professional vector-crisp multi-page PDF audit reports with 1-click download.

---

## 🚀 Quick Start with Docker & Docker Compose (Recommended)

Running WEBSCANNER with Docker Compose is the easiest and most portable way to launch the application with zero dependency overhead.

### 1. Prerequisites
- [Docker](https://docs.docker.com/get-docker/) (Docker Desktop on Windows/macOS or Docker Engine on Linux)
- [Docker Compose v2+](https://docs.docker.com/compose/)

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/webscanner.git
cd webscanner
```

### 3. Configure Environment Variables (Optional)
Copy the example environment configuration:
```bash
cp .env.example .env
```
Edit `.env` to configure your preferred AI provider API key, or use the Native Offline Engine:
```env
# Optional: Gemini API Key for AI threat synthesis
GEMINI_API_KEY="your_gemini_api_key_here"

# Optional: Other AI providers
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
MISTRAL_API_KEY=""
OLLAMA_BASE_URL="http://host.docker.internal:11434"

PORT=3000
```

### 4. Launch with Docker Compose
```bash
docker compose up -d --build
```

### 5. Access the Web Application
Open your browser and navigate to:
```
http://localhost:3000
```

### Useful Docker Commands
```bash
# View real-time container logs
docker compose logs -f

# Check container health status
docker compose ps

# Restart the application
docker compose restart

# Stop and remove containers
docker compose down
```

---

## 🐳 Standalone Docker Container

If you prefer using standard `docker run`:

```bash
# 1. Build the Docker image
docker build -t webscanner:latest .

# 2. Run the container
docker run -d \
  --name webscanner \
  -p 3000:3000 \
  -e GEMINI_API_KEY="your_gemini_api_key_here" \
  -e DEFAULT_AI_PROVIDER="gemini" \
  --restart unless-stopped \
  webscanner:latest
```

Navigate to `http://localhost:3000`.

---

## 📥 Download & Clone from GitHub

### Option A: Clone via Git (Recommended for updates)
```bash
# HTTPS
git clone https://github.com/your-username/webscanner.git

# SSH
git clone git@github.com:your-username/webscanner.git

cd webscanner
```

### Option B: Download ZIP Archive
1. Visit the GitHub repository: `https://github.com/your-username/webscanner`
2. Click the green **Code** button and select **Download ZIP**.
3. Extract the ZIP archive:
   ```bash
   unzip webscanner-main.zip
   cd webscanner-main
   ```

---

## 💻 Manual Local Setup (Node.js)

### Prerequisites
- **Node.js**: v20.0.0 or v22.0.0+
- **npm**: v10.0.0+

### Step-by-Step Installation
```bash
# 1. Clone or extract repository
cd webscanner

# 2. Install all dependencies
npm install

# 3. Create your local environment file
cp .env.example .env

# 4. Start the full-stack development server (Express + Vite)
npm run dev
```

The application will be live at `http://localhost:3000`.

### Building for Production
```bash
# 1. Compile the React Vite frontend
npm run build

# 2. Start the production Node.js server
npm start
```

---

## 🤖 AI-Agnostic Engine Configuration

WEBSCANNER is built from the ground up to be **AI-agnostic**. Users and security teams can choose their preferred LLM provider or operate completely offline in air-gapped environments.

| Provider | Supported Models | Setup / Requirements | Privacy Level |
|---|---|---|---|
| **Custom / Any AI Provider** | **Any Model** (e.g. `deepseek-chat`, `llama-3.3-70b`, `qwen2.5-72b`, `sonar-pro`) | Type any name, model & OpenAI-compatible URL directly in rolling menu | User Choice (Cloud or Local) |
| **Google Gemini** | `gemini-3.8-flash`, `gemini-3.1-pro-preview` | Set `GEMINI_API_KEY` | Cloud (Google Cloud) |
| **OpenAI** | `gpt-4o`, `gpt-4o-mini`, `o3-mini` | Set `OPENAI_API_KEY` or enter in menu | Cloud (OpenAI) |
| **Anthropic Claude** | `claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022` | Set `ANTHROPIC_API_KEY` or enter in menu | Cloud (Anthropic) |
| **Ollama (Self-Hosted)** | `llama3`, `mistral`, `deepseek-r1`, `qwen2.5` | Set `OLLAMA_BASE_URL` (default: `http://localhost:11434`) | **100% On-Premise / Private** |
| **Mistral AI** | `mistral-large-latest`, `mistral-small-latest` | Set `MISTRAL_API_KEY` or enter in menu | Cloud (EU Sovereign) |
| **Native Deterministic Engine** | `Deterministic CISO Engine v1.0` | **Zero configuration required** (built-in fallback) | **100% Offline / Air-Gapped** |

### ✍️ Writing & Choosing Any AI in the Rolling Menu
The rolling menu now features a **Search & Write** field and a **Custom AI Provider** configuration card:
1. **Search or Type Any AI**: Type any provider or model name (e.g. `DeepSeek`, `Groq`, `OpenRouter`, `Perplexity`, `LM Studio`, `Qwen`).
2. **One-Click Presets**: Instantly populate base URLs and models for:
   - **DeepSeek** (`https://api.deepseek.com/v1`, `deepseek-chat`)
   - **Groq** (`https://api.groq.com/openai/v1`, `llama-3.3-70b-versatile`)
   - **OpenRouter** (`https://openrouter.ai/api/v1`, `meta-llama/llama-3.3-70b-instruct`)
   - **Perplexity** (`https://api.perplexity.ai`, `sonar-pro`)
   - **LM Studio / vLLM / LocalAI** (`http://localhost:1234/v1`, `local-model`)
3. **Write Any Custom Model**: For any provider, click **+ Write custom model...** to enter any custom model identifier.
4. **Client-Side Key Storage**: Enter your API key directly in the browser menu — it is saved securely to `localStorage` and never requires server restarts or file modifications.

### Connecting to Local Ollama
To run an on-premise model like Llama 3 or DeepSeek R1 with zero cloud exposure:
1. Install Ollama: `https://ollama.ai/`
2. Pull your model:
   ```bash
   ollama run llama3
   ```
3. Set the endpoint in your `.env`:
   ```env
   DEFAULT_AI_PROVIDER="ollama"
   OLLAMA_BASE_URL="http://localhost:11434"
   OLLAMA_MODEL="llama3"
   ```
   *(When running inside Docker, use `OLLAMA_BASE_URL=http://host.docker.internal:11434`)*

---

## 🌍 Internationalization & Supported Languages

WEBSCANNER comes out-of-the-box with comprehensive internationalization across 8 languages. The executive briefing generated by the AI engine also dynamically translates into the chosen target language.

| Language | Native Name | Code | Layout Direction |
|---|---|---|---|
| **English** | English | `en` | LTR (Left-to-Right) |
| **Spanish** | Español | `es` | LTR (Left-to-Right) |
| **French** | Français | `fr` | LTR (Left-to-Right) |
| **German** | Deutsch | `de` | LTR (Left-to-Right) |
| **Japanese** | 日本語 | `ja` | LTR (Left-to-Right) |
| **Simplified Chinese** | 简体中文 | `zh` | LTR (Left-to-Right) |
| **Portuguese** | Português | `pt` | LTR (Left-to-Right) |
| **Arabic** | العربية | `ar` | **RTL (Right-to-Left)** |

Switch languages at any time using the global language selector in the top-right header.

---

## 📱 Downloadable Mobile Version (Android & iOS PWA)

WEBSCANNER is built as a fully installable **Progressive Web App (PWA)**, allowing you to install and run it on your smartphone with a native app experience, no App Store or Play Store downloads required.

### 🤖 Android (Google Chrome & Edge)
1. Open WEBSCANNER in **Chrome** or **Edge** on your Android phone.
2. A download banner will prompt: **"Install App"** (or click the **"Mobile App"** button in the header).
3. Tap **Install** to add WEBSCANNER to your home screen and app launcher.
4. The app opens in a standalone full-screen window with custom cybersecurity icon and zero browser UI.

### 🍎 iPhone & iPad (Apple Safari)
1. Open WEBSCANNER in **Safari** on your iOS device.
2. Tap the **Share** button (`⎋` / square with arrow) in the bottom toolbar.
3. Scroll down and tap **"Add to Home Screen"** (`➕`).
4. Tap **Add** in the top-right corner. The WEBSCANNER app icon will now appear on your iPhone home screen!

### 💻 Desktop to Mobile (Scan QR Code)
If you are currently browsing on your computer:
1. Click the **"Mobile App"** button in the top navigation bar.
2. Select the **"Scan QR Code"** tab.
3. Point your smartphone camera at the screen to instantly open and install WEBSCANNER on your phone!

### ⚡ Offline Caching & Connectivity
- Integrated **Service Worker** caches all critical CSS, JS, fonts, and assets for offline use.
- When network is lost, the app switches to an offline badge and utilizes the **Native Deterministic Rule Engine** for CVSS vulnerability scoring.

---

## 📡 REST API Reference

WEBSCANNER includes a built-in headless REST API allowing automated CI/CD security gating and programmatic vulnerability testing.

### 1. Execute Vulnerability Scan
```http
POST /api/scan
Content-Type: application/json
```

#### Request Payload:
```json
{
  "url": "https://example.com",
  "deepAiScan": true,
  "lang": "en",
  "aiProvider": "gemini",
  "aiModel": "gemini-3.8-flash"
}
```

#### Response (Excerpt):
```json
{
  "id": "SCAN-MUHCXNC4",
  "url": "https://example.com",
  "hostname": "example.com",
  "ip": "93.184.216.34",
  "scanTimestamp": "2026-09-25T19:32:10.468Z",
  "scanDurationMs": 1738,
  "score": 85,
  "grade": "A",
  "flaws": [
    {
      "id": "FLAW-CSP-MISSING",
      "title": "Missing Content-Security-Policy (CSP) Header",
      "severity": "HIGH",
      "category": "HEADERS",
      "cvssScore": 7.5,
      "cve": "CWE-1021",
      "description": "Website is unprotected against XSS and code injection.",
      "remediation": "Configure a strict Content-Security-Policy header."
    }
  ],
  "headersAudit": [...],
  "sslInfo": {
    "valid": true,
    "issuer": { "organization": "DigiCert Inc" },
    "daysRemaining": 184
  },
  "dnsRecords": {
    "spf": { "valid": true, "record": "v=spf1 -all" },
    "dmarc": { "valid": true, "policy": "reject" }
  },
  "aiAnalysis": {
    "provider": "gemini",
    "executiveSummary": "Target endpoint shows strong baseline controls...",
    "remediationRoadmap": [...]
  }
}
```

### 2. Query Available AI Providers
```http
GET /api/ai-providers
```

#### Response:
```json
{
  "activeProvider": "gemini",
  "providers": [
    {
      "id": "gemini",
      "name": "Google Gemini",
      "defaultModel": "gemini-3.8-flash",
      "availableModels": ["gemini-3.8-flash", "gemini-3.1-pro-preview"],
      "isConfigured": true,
      "isLocal": false
    },
    {
      "id": "offline",
      "name": "Native Deterministic Rule Engine",
      "isConfigured": true,
      "isLocal": true
    }
  ]
}
```

---

## 📁 Repository Structure

```
├── .dockerignore              # Excluded files for clean Docker builds
├── .env.example               # Template environment configuration
├── Dockerfile                 # Production multi-stage Alpine Docker build
├── docker-compose.yml         # Container orchestration specification
├── index.html                 # Entry point with SEO metadata & typography
├── metadata.json              # Studio capabilities configuration
├── package.json               # Dependencies and runner scripts
├── README.md                  # Comprehensive documentation and setup guide
├── server.ts                  # Express full-stack backend with OSINT probes
├── server/
│   └── aiRouter.ts            # AI-Agnostic Engine (Gemini, OpenAI, Claude, Ollama, Offline)
├── tsconfig.json              # TypeScript compilation configuration
├── vite.config.ts             # Vite bundling and Tailwind CSS v4 configuration
└── src/
    ├── App.tsx                # Primary application controller and navigation
    ├── index.css              # Tailwind CSS styling and print media rules
    ├── main.tsx               # React 19 application mount
    ├── types/
    │   └── scanner.ts         # TypeScript interfaces for audit results
    ├── i18n/
    │   ├── translations.ts    # 8-language localization dictionaries
    │   └── LanguageContext.tsx # Dynamic language provider and RTL handler
    ├── utils/
    │   ├── pdfGenerator.ts    # Multi-page vector PDF audit report builder
    │   └── sampleScan.ts      # Curated preloaded security audit demo
    └── components/
        ├── Header.tsx         # 3-zone header with language selector
        ├── ScanInput.tsx      # Target input, sample buttons, and live step progress
        ├── ScanOverview.tsx   # Posture score gauge, grade badge, and metric cards
        ├── FlawsList.tsx      # Severity filters and copyable remediation code
        ├── DeployModal.tsx    # Interactive Docker & GitHub deployment guide
        ├── AiProviderSelector.tsx # Dynamic AI model and provider switcher
        └── tabs/
            ├── HeadersAudit.tsx      # HTTP security headers matrix
            ├── SslDnsAudit.tsx        # SSL/TLS & SPF/DMARC anti-spoofing audit
            ├── TechPortsAudit.tsx     # Tech stack, open ports & robots.txt
            └── AiExecutiveReport.tsx  # CISO Executive threat briefing
```

---

## ⚙️ Environment Variables Reference

| Variable | Provider / Feature | Default | Description |
|---|---|---|---|
| `PORT` | Web Server | `3000` | Port for the full-stack Express server |
| `NODE_ENV` | Runtime | `development` / `production` | Set to `production` in container environments |
| `DEFAULT_AI_PROVIDER` | AI Engine | `gemini` | Default provider: `gemini`, `openai`, `anthropic`, `ollama`, `mistral`, or `offline` |
| `GEMINI_API_KEY` | Google Gemini | `""` | Gemini API key for `gemini-3.8-flash` or `gemini-3.1-pro-preview` |
| `OPENAI_API_KEY` | OpenAI | `""` | OpenAI API key for `gpt-4o`, `gpt-4o-mini`, etc. |
| `OPENAI_MODEL` | OpenAI | `gpt-4o` | Default model identifier for OpenAI |
| `ANTHROPIC_API_KEY` | Anthropic | `""` | Anthropic API key for `claude-3-5-sonnet-20241022` |
| `ANTHROPIC_MODEL` | Anthropic | `claude-3-5-sonnet-20241022` | Default model identifier for Claude |
| `MISTRAL_API_KEY` | Mistral AI | `""` | Mistral API key for `mistral-large-latest` |
| `MISTRAL_MODEL` | Mistral AI | `mistral-large-latest` | Default model identifier for Mistral |
| `OLLAMA_BASE_URL` | Ollama (Local) | `http://localhost:11434` | Ollama service endpoint (or `http://host.docker.internal:11434` in Docker) |
| `OLLAMA_MODEL` | Ollama (Local) | `llama3` | Default local model (e.g., `llama3`, `mistral`, `deepseek-r1`) |

*Note: If no API keys are configured, WEBSCANNER will automatically operate in **Native Deterministic Mode** with 100% offline analysis.*

---

## 🔒 Security, Ethics & Responsible Disclosure

WEBSCANNER is built strictly for **defensive security auditing, authorized vulnerability assessments, and educational reconnaissance**.

- **Non-Destructive**: It does **not** execute denial-of-service tests, exploit payloads, or state-altering requests.
- **Passive & Benign**: Probing is standard DNS resolution, TLS handshakes, HTTP GET requests, and safe TCP socket checks with short timeouts.
- **SSRF Prevention**: Built-in protections prevent scans targeting private or loopback subnets (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`, `172.16.0.0/12`).
- **Authorization**: Only scan domains and endpoints that you own or have explicit written permission to audit.

---

## 📄 License

Distributed under the Apache 2.0 License. See [LICENSE](LICENSE) for more information.
