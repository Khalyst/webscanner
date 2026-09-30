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
- [Administrator Incident Alerting & Real-Time SMTP Validator](#-administrator-incident-alerting--real-time-smtp-validator)
- [Software Updates & CVE Patch Auditor](#-software-updates--cve-patch-auditor)
- [Passive Subdomain & Certificate Transparency OSINT (crt.sh)](#-passive-subdomain--certificate-transparency-osint-crtsh)
- [Model Context Protocol (MCP) Hub & Interactive Tool Runner](#-model-context-protocol-mcp-hub--interactive-tool-runner)
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

- **Recent Audits History & Instant Recall**: Automatically preserves prior vulnerability audits in browser local storage with zero server footprint. Features a Dedicated History Drawer with search filters, quick target chips underneath the search input, average score telemetry, 1-click re-scan, and batch export to JSON/CSV.
- **Administrator Incident Alerting & Multi-Channel Dispatcher**: Real-time incident reporting to Slack, Discord, custom SIEM/PagerDuty webhooks, and direct RFC-compliant email advisories with executive severity matrix.
- **Real-Time SMTP Connection & Credential Validator**: Built-in mail server testing utility that verifies TCP sockets, TLS handshakes (`STARTTLS`/`SSL`), and SMTP credentials before allowing security emails to be sent, with round-trip latency metering and diagnostic troubleshooting advice.
- **Software Updates & CVE Patch Auditor**: Automatic fingerprinting of web servers, runtimes, and CMS engines with End-of-Life (EOL) warnings, mapped CVE advisories, and downloadable one-click bash remediation scripts (`patch-<hostname>.sh`).
- **Interactive Fix Simulator & Score Projection**: Interactive checklist allowing security engineers and developers to simulate remediating findings in real-time. Dynamically models projected CVSS score recovery (e.g. from 58 D to 84 B) and outputs a ready-to-paste markdown remediation action plan for Jira or GitHub issues.
- **One-Click Shareable Summary Card**: Generates and copies clean, formatted Markdown briefings for Slack, Discord, Microsoft Teams, and bug trackers with target metadata, grades, SSL status, and top remediation priorities.
- **Power-User Keyboard Shortcuts**: Instant keyboard navigation with `/` or `Cmd/Ctrl + K` to focus scan target, `1` through `7` for direct tab switching, `H` for audit history, and `Esc` to dismiss modals.
- **Passive Subdomain & Certificate Transparency OSINT (`crt.sh`)**: Queries global SSL/TLS Certificate Transparency logs to discover unlisted subdomains, hidden APIs, and staging portals without sending direct packets to the target. Features automatic classification into Dev/Staging, Admin/Portal, API/Gateway, Infrastructure, and Storage buckets, live DNS resolving verification, and 1-click pivot scanning.
- **Model Context Protocol (MCP) Hub & Tool Runner**: Full implementation of the MCP v1.0 standard with a built-in server registry and live JSON-RPC execution engine. Comes pre-integrated with 4 built-in OSINT tool servers (`crt.sh`, `Wayback Machine CDX Archive Crawler`, `DNS Intelligence`, and `IP/ASN Threat Intelligence`) plus support for connecting custom local/remote MCP servers (HTTP/SSE) with interactive schema parameter inputs and latency tracking.
- **Bulk URL Queue & Multi-Target Audits**: Queue dozens or hundreds of URLs via comma-separated list, line-by-line text, or file upload (`.txt`, `.csv`, `.json`). Features sequential rate-limiting protection, pause/resume controls, error retrying, average score computation, individual report drilldown, and batch export to both CSV and JSON formats.
- **HTTP Security Headers Matrix**: Evaluates OWASP-recommended headers (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `COOP`, `COEP`, `CORP`) with PASS/WARN/FAIL status and server configuration snippets (`Nginx`, `Apache`, `Express`, `Cloudflare`).
- **TLS / SSL Cryptographic Audit**: Live socket probing of SSL/TLS certificates, expiry days countdown, cipher strength, protocol version (`TLSv1.3`, `TLSv1.2`), and Subject Alternative Names (SANs).
- **DNS & Email Anti-Spoofing Audit**: Complete resolution of A, AAAA, MX, TXT, NS, CNAME, and SOA records; automated analysis of SPF qualifiers (`-all`, `~all`, `+all`) and DMARC enforcement policies (`reject`, `quarantine`, `none`).
- **Server & Tech Stack Fingerprinting**: Discovers underlying web servers (Nginx, Apache, Caddy), backend languages, CMS systems (WordPress, Drupal, Shopify), and flags version disclosure vulnerabilities with mapped CVE advisories.
- **Port & Network Service Reconnaissance**: Non-destructive socket checks across key management and database ports (`80`, `443`, `8080`, `8443`, `22` SSH, `21` FTP, `3306` MySQL, `5432` PostgreSQL).
- **Sensitive Files & Crawling Audit**: Analyzes `robots.txt` for exposed administrative routes, validates RFC 9116 `security.txt` compliance, and probes for exposed configuration dotfiles (`.git/HEAD`, `.env`).
- **Algorithmic CVSS Scoring & Grade**: Computes an algorithmic 0–100 security posture score and assigns an actionable letter grade (`A+` to `F`).
- **Multilingual Support (8 Languages)**: Fully localized interface in English, Spanish (Español), French (Français), German (Deutsch), Japanese (日本語), Simplified Chinese (简体中文), Portuguese (Português), and Arabic (العربية with native RTL bidirectional layout).
- **Downloadable Mobile App (PWA & Offline)**: Install WEBSCANNER on your smartphone (Android & iPhone) with 1-click install, native app launcher icon, standalone full-screen window, and offline caching powered by Service Workers.
- **Default Deterministic Engine & BYOK AI (Zero Host Account Usage)**: Scans default to the 100% free, private **Native Deterministic Rule Engine** (zero API keys, zero cloud costs). Users and mobile app users bring their own API keys (BYOK) if they want to run Google Gemini, OpenAI, Anthropic Claude, or Mistral. The host's personal Gemini account is never used or charged.
- **Exportable PDF Audit Reports**: Generates professional vector-crisp multi-page PDF audit reports with 1-click download.

---

## 🚨 Administrator Incident Alerting & Real-Time SMTP Validator

WEBSCANNER features an enterprise-grade **Incident Notification & Security Advisory Dispatcher** with multi-channel alerting and real-time mail server connection verification.

```
[ Target Scan Complete ]
         │
         ▼
[ Admin Alert Modal ] ──────► Real-Time SMTP Validator (TCP / TLS / AUTH / Latency ms)
         │
         ├──► 📨 Direct SMTP Relay (Gmail, SendGrid, Office 365, Mailgun, Corporate SMTP)
         ├──► ✉️ Native Mail Client (1-Click mailto: with full markdown advisory pre-filled)
         ├──► 💬 Slack Webhook (Rich Incident Block Kit with action items)
         ├──► 🎮 Discord Webhook (Embedded color-coded incident cards)
         └──► 📡 Custom Webhook / SIEM (PagerDuty, Opsgenie, Splunk JSON payload)
```

### Highlights & Capabilities
- **Real-Time SMTP Socket & Credential Testing**:
  - Live pre-flight socket verification to target mail server port (`587` STARTTLS, `465` SSL direct, `25`).
  - Tests authentication credentials (`AUTH LOGIN` / `AUTH PLAIN`) using `nodemailer` transport verification before allowing security emails to be dispatched.
  - Returns round-trip connection latency in milliseconds (e.g. `⚡ 84ms latency`).
  - Actionable error diagnostics: Categorizes specific failure codes (`EAUTH`, `ETIMEDOUT`, `ECONNREFUSED`, `ENOTFOUND`) with prescriptive troubleshooting advice.
- **Provider Presets**: Instant 1-click configuration for **Google Workspace / Gmail** (`smtp.gmail.com`), **SendGrid** (`smtp.sendgrid.net`), **Microsoft Office 365** (`smtp.office365.com`), and **Mailgun** (`smtp.mailgun.org`).
- **Dual Email Architecture**:
  - **Option A (Direct Server Relay)**: Transmits formatted responsive HTML & plain-text incident advisories via configured SMTP, Resend, or SendGrid.
  - **Option B (Native Mail Client Fallback)**: One-click `mailto:` launch opening your native desktop or mobile email app pre-populated with the complete advisory text, findings count, and remediation instructions.
- **Policy Enforcement**: Gated transmission ensures untested credentials cannot trigger silent delivery errors, keeping alert pipelines reliable.

---

## 📦 Software Updates & CVE Patch Auditor

WEBSCANNER audits identified web server runtimes, reverse proxies, and Content Management Systems against current CVE security vulnerability catalogs and vendor patch baselines.

- **Component Version Identification**: Fingerprints versions for Nginx, Apache HTTP Server, Caddy, Microsoft IIS, PHP, Node.js, Python, WordPress, Drupal, Joomla, and more.
- **End-of-Life (EOL) & CVE Mapping**: Flags obsolete versions no longer receiving upstream security patches and maps detected software to active High and Critical CVE advisories.
- **Automated Remediation Shell Scripts**: Generates executable, copyable bash upgrade scripts tailored to Ubuntu/Debian (`apt-get`), RHEL/CentOS/Fedora (`dnf`), Docker (`docker compose pull`), and application package managers.
- **1-Click Download**: Export system patch scripts directly as `patch-<hostname>.sh`.

---

## 🌐 Passive Subdomain & Certificate Transparency OSINT (crt.sh)

WEBSCANNER integrates automated **Certificate Transparency (CT) log aggregation** via `crt.sh`. Every SSL/TLS certificate issued by public Certificate Authorities (Let's Encrypt, DigiCert, Cloudflare, Sectigo) is logged to append-only, cryptographic public CT logs.

### Why Passive CT Reconnaissance Matters
Unlike traditional brute-force DNS enumeration (which floods nameservers with thousands of DNS requests and can be detected or rate-limited), **passive Certificate Transparency querying sends zero packets to the target network**.

```
[ Target Domain Input ] ────────► [ crt.sh Global CT Logs ]
                                           │
       ┌───────────────────────────────────┴───────────────────────────────────┐
       ▼                                   ▼                                   ▼
[ Dev / Staging Portals ]          [ Admin / Auth Gateways ]           [ APIs & Microservices ]
  dev.target.com                     admin.target.com                    api.target.com
  staging.target.com                 vpn.target.com                      graphql.target.com
  uat.target.com                     sso.target.com                      backend.target.com
```

### Features & Capabilities
- **Automated Risk Categorization**:
  - **Dev & Staging (Shadow IT)**: Detects forgotten staging instances, beta builds, and QA servers (`dev.*`, `staging.*`, `test.*`, `sandbox.*`). Raises automated CVSS security warnings if active non-production environments are publicly exposed.
  - **Admin & Portals**: Identifies administrative gateways (`admin.*`, `vpn.*`, `portal.*`, `corp.*`, `bastion.*`).
  - **API Services**: Discovers microservice endpoints (`api.*`, `graphql.*`, `rest.*`, `ws.*`).
  - **Infrastructure & Storage**: Flags mail relays, nameservers, and cloud object stores (`s3.*`, `cdn.*`, `assets.*`).
- **Live DNS Probing**: Verifies whether historical subdomains are actively resolving to live IPv4/IPv6 addresses, pinpointing active hosts versus retired DNS records.
- **Instant Pivot Scanning**: Click **"Scan Target"** next to any discovered subdomain to immediately launch a full security scan on that newly uncovered host.
- **Export & Filtering**: Real-time category filters, resolving-only toggles, keyword search, one-click clipboard copying, and CSV export.

---

## 🔌 Model Context Protocol (MCP) Hub & Interactive Tool Runner

WEBSCANNER implements the **Model Context Protocol (MCP)** specification (v1.0), enabling AI models, autonomous agents, and security researchers to discover, inspect, and invoke standardized OSINT tools.

### What is Model Context Protocol?
MCP is an open standard that allows LLMs to query external security databases and tools deterministically through standard JSON-RPC 2.0 schemas.

### Pre-Installed Built-in MCP Servers & Tools
WEBSCANNER includes 4 operational built-in MCP tools ready to use:

| MCP Server | Tool Name | Category | Description |
|---|---|---|---|
| **crt.sh CT Log MCP** | `discover_subdomains` | OSINT | Passive CT log search discovering all registered subdomains and shadow IT assets. |
| **Wayback Machine CDX MCP** | `search_historical_urls` | RECON | Crawls Internet Archive CDX indices to locate exposed backup files (`.bak`, `.sql`, `.env`), config files, and historical API endpoints. |
| **DNS Intelligence MCP** | `inspect_dns_intel` | NETWORK | Zone intelligence, MX mail routing, and SPF/DMARC anti-spoofing policy analysis. |
| **IP & ASN Threat Intel MCP** | `probe_ip_reputation` | INTELLIGENCE | Reverse DNS PTR lookup, RFC 1918 bogon validation, and threat risk analysis. |

### Interactive MCP Hub UI
Click the **"MCP Hub"** button in the top navigation bar to open the interactive MCP modal:
- **Server Registry**: View connection status and latency of all connected MCP servers.
- **Interactive Tool Runner**: Select any tool from the catalog, configure JSON-RPC parameters via dynamic forms, execute the tool call in real time, and inspect structured JSON results with latency diagnostics.
- **Connect Custom MCP Servers**: Register third-party or local MCP servers over **Streamable HTTP** or **Server-Sent Events (SSE)** with optional Bearer Token authentication.

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
Edit `.env` to configure optional AI provider API keys, or run the default Native Offline Engine (no keys needed):
```env
# Default: 100% free, private Native Deterministic Rule Engine
DEFAULT_AI_PROVIDER="offline"

# Optional: User-provided API keys (BYOK) for cloud AI synthesis
GEMINI_API_KEY=""
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

# 2. Run the container (defaults to 100% free offline rule engine)
docker run -d \
  --name webscanner \
  -p 3000:3000 \
  -e DEFAULT_AI_PROVIDER="offline" \
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
| **Native Deterministic Engine (Default)** | `Deterministic CISO Engine v1.0` | **Zero configuration required** (100% free built-in rule engine) | **100% Offline / Air-Gapped** |
| **Custom / Any AI Provider** | **Any Model** (e.g. `deepseek-chat`, `llama-3.3-70b`, `qwen2.5-72b`, `sonar-pro`) | Type any name, model & OpenAI-compatible URL directly in rolling menu | User Choice (Cloud or Local) |
| **Google Gemini (BYOK)** | `gemini-3.8-flash`, `gemini-3.1-pro-preview` | Bring Your Own Key: Enter personal key in browser menu | Cloud (User's Google Account) |
| **OpenAI** | `gpt-4o`, `gpt-4o-mini`, `o3-mini` | Bring Your Own Key: Enter in menu or set `OPENAI_API_KEY` | Cloud (User's OpenAI Account) |
| **Anthropic Claude** | `claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022` | Bring Your Own Key: Enter in menu or set `ANTHROPIC_API_KEY` | Cloud (User's Anthropic Account) |
| **Ollama (Self-Hosted)** | `llama3`, `mistral`, `deepseek-r1`, `qwen2.5` | Set `OLLAMA_BASE_URL` (default: `http://localhost:11434`) | **100% On-Premise / Private** |
| **Mistral AI** | `mistral-large-latest`, `mistral-small-latest` | Bring Your Own Key: Enter in menu or set `MISTRAL_API_KEY` | Cloud (EU Sovereign) |

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

### 3. Passive Subdomain & CT Logs Enumeration
```http
GET /api/osint/subdomains?domain=example.com
```

#### Response:
```json
{
  "domain": "example.com",
  "queriedAt": "2026-09-28T19:50:00.000Z",
  "totalFound": 14,
  "uniqueSubdomains": ["admin.example.com", "api.example.com", "dev.example.com"],
  "subdomains": [
    {
      "subdomain": "dev.example.com",
      "category": "DEV_STAGING",
      "isWildcard": false,
      "isResolving": true,
      "resolvedIp": "93.184.216.34",
      "issuerName": "Let's Encrypt Authority X3",
      "loggedAt": "2026-04-12T14:22:00Z"
    }
  ],
  "categoriesCount": {
    "devStaging": 1,
    "adminPortal": 1,
    "apiService": 1,
    "infrastructure": 0,
    "storage": 0,
    "general": 0
  },
  "hasWildcardCerts": false,
  "source": "crt.sh (Certificate Transparency Logs)"
}
```

### 4. Model Context Protocol (MCP) Tool Execution
```http
POST /api/mcp/call
Content-Type: application/json
```

#### Request Payload:
```json
{
  "serverId": "crtsh-builtin",
  "toolName": "discover_subdomains",
  "arguments": {
    "domain": "example.com"
  }
}
```

#### Response:
```json
{
  "success": true,
  "result": { ... },
  "executionTimeMs": 24,
  "toolName": "discover_subdomains",
  "serverId": "crtsh-builtin"
}
```

### 5. Real-Time SMTP Connection & Credential Testing
```http
POST /api/alerts/smtp-test
Content-Type: application/json
```

#### Request Payload:
```json
{
  "host": "smtp.gmail.com",
  "port": 587,
  "user": "security-admin@yourcompany.com",
  "pass": "app-specific-password",
  "secure": false,
  "from": "security-alerts@yourcompany.com"
}
```

#### Response:
```json
{
  "success": true,
  "latencyMs": 84,
  "message": "SMTP connection established and authenticated successfully with smtp.gmail.com:587 (84ms).",
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": false,
  "user": "security-admin@yourcompany.com"
}
```

### 6. Administrator Incident Alert Dispatcher
```http
POST /api/alerts/dispatch
Content-Type: application/json
```

#### Request Payload:
```json
{
  "channel": "email",
  "adminEmail": "security-lead@target.com",
  "hostname": "target.com",
  "targetUrl": "https://target.com",
  "alertSeverity": "HIGH",
  "overallScore": 64,
  "securityGrade": "C",
  "criticalFlawsCount": 1,
  "highFlawsCount": 3,
  "outdatedUpdatesCount": 2,
  "vulnerabilities": [...],
  "missingUpdates": [...]
}
```

#### Response:
```json
{
  "success": true,
  "channel": "email",
  "deliveryStatus": "delivered",
  "message": "Security advisory email dispatched via verified SMTP host (smtp.gmail.com:587) to security-lead@target.com",
  "httpCode": 200,
  "recipient": "security-lead@target.com",
  "dispatchedAt": "2026-09-30T15:10:00.000Z"
}
```

---

## 📁 Repository Structure

```
├── .dockerignore              # Excluded files for clean Docker builds
├── .env.example               # Template environment configuration (AI keys & SMTP relay)
├── Dockerfile                 # Production multi-stage Alpine Docker build
├── docker-compose.yml         # Container orchestration specification
├── index.html                 # Entry point with SEO metadata & typography
├── metadata.json              # Studio capabilities configuration
├── package.json               # Dependencies and runner scripts
├── README.md                  # Comprehensive documentation and setup guide
├── server.ts                  # Express full-stack backend with OSINT probes & alert APIs
├── server/
│   ├── aiRouter.ts            # AI-Agnostic Engine (Gemini, OpenAI, Claude, Ollama, Offline)
│   ├── crtShService.ts        # Passive Certificate Transparency (crt.sh) subdomains engine
│   ├── emailService.ts        # Real-time SMTP testing, advisory HTML/text, & multi-relay dispatch
│   └── mcpService.ts          # Model Context Protocol (MCP) server registry & JSON-RPC dispatcher
├── tsconfig.json              # TypeScript compilation configuration
├── vite.config.ts             # Vite bundling and Tailwind CSS v4 configuration
└── src/
    ├── App.tsx                # Primary application controller and navigation
    ├── index.css              # Tailwind CSS styling and print media rules
    ├── main.tsx               # React 19 application mount
    ├── types/
    │   └── scanner.ts         # TypeScript interfaces for audit results, SMTP & alert payloads
    ├── i18n/
    │   ├── translations.ts    # 8-language localization dictionaries
    │   └── LanguageContext.tsx # Dynamic language provider and RTL handler
    ├── utils/
    │   ├── pdfGenerator.ts    # Multi-page vector PDF audit report builder
    │   ├── sampleScan.ts      # Curated preloaded security audit demo
    │   └── softwareUpdates.ts # Software version profiling, CVE mapping & bash patch script generator
    └── components/
        ├── Header.tsx         # 3-zone header with MCP Hub and language selector
        ├── ScanInput.tsx      # Target input, sample buttons, and live step progress
        ├── ScanOverview.tsx   # Posture score gauge, grade badge, and metric cards
        ├── FlawsList.tsx      # Severity filters and copyable remediation code
        ├── AdminAlertModal.tsx # Incident alert modal with Real-Time SMTP Validator & Dispatcher
        ├── DeployModal.tsx    # Interactive Docker & GitHub deployment guide
        ├── McpHubModal.tsx    # Interactive Model Context Protocol (MCP) Hub dialog
        ├── AiProviderSelector.tsx # Dynamic AI model and provider switcher
        └── tabs/
            ├── HeadersAudit.tsx        # HTTP security headers matrix
            ├── SslDnsAudit.tsx          # SSL/TLS & SPF/DMARC anti-spoofing audit
            ├── SoftwareUpdatesAudit.tsx # Software versions, EOL checks & CVE patch scripts
            ├── TechPortsAudit.tsx       # Tech stack, open ports & robots.txt
            ├── SubdomainsAudit.tsx      # Certificate Transparency & Subdomains OSINT tab
            └── AiExecutiveReport.tsx    # CISO Executive threat briefing
```

---

## ⚙️ Environment Variables Reference

| Variable | Provider / Feature | Default | Description |
|---|---|---|---|
| `PORT` | Web Server | `3000` | Port for the full-stack Express server |
| `NODE_ENV` | Runtime | `development` / `production` | Set to `production` in container environments |
| `DEFAULT_AI_PROVIDER` | AI Engine | `offline` | Default provider: `offline` (free rule engine), `gemini`, `openai`, `anthropic`, `ollama`, or `mistral` |
| `GEMINI_API_KEY` | Google Gemini (Optional) | `""` | Optional personal Gemini API key (BYOK); scans default to free offline rule engine |
| `OPENAI_API_KEY` | OpenAI (Optional) | `""` | Optional OpenAI API key for `gpt-4o`, `gpt-4o-mini`, etc. |
| `OPENAI_MODEL` | OpenAI | `gpt-4o` | Default model identifier for OpenAI |
| `ANTHROPIC_API_KEY` | Anthropic (Optional) | `""` | Optional Anthropic API key for `claude-3-5-sonnet-20241022` |
| `ANTHROPIC_MODEL` | Anthropic | `claude-3-5-sonnet-20241022` | Default model identifier for Claude |
| `MISTRAL_API_KEY` | Mistral AI (Optional) | `""` | Optional Mistral API key for `mistral-large-latest` |
| `MISTRAL_MODEL` | Mistral AI | `mistral-large-latest` | Default model identifier for Mistral |
| `OLLAMA_BASE_URL` | Ollama (Local) | `http://localhost:11434` | Ollama service endpoint (or `http://host.docker.internal:11434` in Docker) |
| `OLLAMA_MODEL` | Ollama (Local) | `llama3` | Default local model (e.g., `llama3`, `mistral`, `deepseek-r1`) |
| `SMTP_HOST` | Email / Alerts (Optional) | `""` | Outbound mail server hostname (e.g. `smtp.gmail.com`, `mail.yourserver.com`) |
| `SMTP_PORT` | Email / Alerts (Optional) | `587` | Outbound mail server port (`587` STARTTLS or `465` SSL direct) |
| `SMTP_USER` | Email / Alerts (Optional) | `""` | SMTP authentication username / account email |
| `SMTP_PASS` | Email / Alerts (Optional) | `""` | SMTP authentication password or 16-character App Password |
| `SMTP_FROM` | Email / Alerts (Optional) | `security-alerts@webscanner.local` | Default RFC-compliant From address for security advisories |
| `RESEND_API_KEY` | Email / Alerts (Optional) | `""` | Optional Resend API key for direct transactional email delivery |
| `SENDGRID_API_KEY` | Email / Alerts (Optional) | `""` | Optional SendGrid API key for direct transactional email delivery |

*Note: Without any API keys configured, WEBSCANNER automatically runs in **Native Deterministic Mode** with 100% offline, free analysis. SMTP connection testing and credentials can also be tested and configured live directly within the Admin Alert UI.*

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
