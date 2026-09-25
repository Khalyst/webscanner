# WEBSCANNER 🛡️

> **Deep Website Vulnerability Scanner & OSINT Security Audit Engine**  
> Inspired by `web-check.xyz` with automated flaw detection, AI-powered CISO executive briefings, 8 supported languages, and instant vector-crisp PDF reports.

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](docker-compose.yml)
[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js&logoColor=white)](package.json)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](src/App.tsx)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](tsconfig.json)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?logo=tailwind-css&logoColor=white)](src/index.css)

---

## 🌟 Key Features

- **HTTP Security Headers Matrix**: Deep auditing of OWASP-recommended headers (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `COOP`, `COEP`, `CORP`) with PASS/WARN/FAIL status and remediation directives.
- **TLS / SSL Cryptographic Inspection**: Live socket probing of SSL/TLS certificates, expiry days countdown, cipher suite strength, protocol version (`TLSv1.3`, `TLSv1.2`), and Subject Alternative Names (SANs).
- **DNS & Anti-Spoofing Audit**: Complete resolution of A, AAAA, MX, TXT, NS, CNAME, and SOA records; automated analysis of SPF qualifiers (`-all`, `~all`, `+all`) and DMARC enforcement policies (`reject`, `quarantine`, `none`).
- **Server & Tech Stack Fingerprinting**: Discovers underlying web servers (Nginx, Apache, Caddy), backend languages, CMS systems (WordPress, Drupal, Shopify), and flags version disclosure vulnerabilities with mapped CVE advisories.
- **Port & Network Service Reconnaissance**: Non-destructive socket checks across key management and database ports (`80`, `443`, `8080`, `8443`, `22` SSH, `21` FTP, `3306` MySQL, `5432` PostgreSQL).
- **Sensitive Files & Crawling Audit**: Analyzes `robots.txt` for exposed administrative routes, validates RFC 9116 `security.txt` compliance, and probes for exposed configuration dotfiles (`.git/HEAD`, `.env`).
- **CVSS Posture Scoring & Grade**: Computes an algorithmic 0–100 security posture score and assigns an actionable letter grade (`A+` to `F`).
- **Multilingual Support (8 Languages)**: Fully localized interface in English, Spanish (Español), French (Français), German (Deutsch), Japanese (日本語), Simplified Chinese (简体中文), Portuguese (Português), and Arabic (العربية with native RTL layout).
- **AI Executive CISO Briefing (Gemini 3.8 Flash)**: Generates high-impact management summaries, external attack surface evaluations, top threat vectors, compliance readiness (OWASP Top 10, PCI-DSS, ISO 27001), and prioritized remediation playbooks in the selected language.
- **Exportable PDF Audit Reports**: Generates professional vector-crisp multi-page PDF audit reports with 1-click download.

---

## 🚀 Quick Start with Docker & Docker Compose (Recommended)

Running WEBSCANNER with Docker Compose is the easiest and most portable way to launch the application.

### 1. Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed (Docker Desktop on Windows/macOS or Docker Engine on Linux)
- [Docker Compose](https://docs.docker.com/compose/) (v2+ included with Docker)

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
Edit `.env` to add your Gemini API Key for AI Executive analysis (optional — deterministic defensive rules engine operates seamlessly without it):
```env
GEMINI_API_KEY="your_gemini_api_key_here"
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

To view real-time container logs:
```bash
docker compose logs -f
```

To stop the container:
```bash
docker compose down
```

---

## 🐳 Standalone Docker Container

If you prefer using standard `docker run`:

```bash
# Build the Docker image
docker build -t webscanner:latest .

# Run the container
docker run -d \
  --name webscanner \
  -p 3000:3000 \
  -e GEMINI_API_KEY="your_gemini_api_key_here" \
  --restart unless-stopped \
  webscanner:latest
```

Open `http://localhost:3000` in your web browser.

---

## 💻 Manual Local Development (Node.js)

### Prerequisites
- Node.js 20 or 22+
- npm 10+

### Setup & Launch
```bash
# 1. Clone repository
git clone https://github.com/your-username/webscanner.git
cd webscanner

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env

# 4. Start development server with live reload
npm run dev
```

The application will be running on `http://localhost:3000`.

### Building for Production
```bash
# Compile frontend bundle
npm run build

# Start production server
npm start
```

---

## 📁 Repository Structure

```
├── .dockerignore              # Excluded files for clean Docker builds
├── .env.example               # Template environment configuration
├── Dockerfile                 # Production multi-stage Docker build
├── docker-compose.yml         # Container orchestration specification
├── index.html                 # Entry point with SEO metadata & typography
├── metadata.json              # Studio capabilities configuration
├── package.json               # Dependencies and runner scripts
├── README.md                  # Comprehensive setup & usage guide
├── server.ts                  # Express full-stack backend with OSINT probes & Gemini integration
├── tsconfig.json              # TypeScript compilation configuration
├── vite.config.ts             # Vite bundling and Tailwind integration
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
        └── tabs/
            ├── HeadersAudit.tsx      # HTTP security headers matrix
            ├── SslDnsAudit.tsx        # SSL/TLS & SPF/DMARC anti-spoofing audit
            ├── TechPortsAudit.tsx     # Tech stack, open ports & robots.txt
            └── AiExecutiveReport.tsx  # CISO Executive threat briefing
```

---

## ⚙️ Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | Optional | `3000` | Port for the full-stack Express server |
| `GEMINI_API_KEY` | Optional | `""` | Google Gemini API key for AI CISO Executive Briefings |
| `NODE_ENV` | Optional | `development` | Set to `production` in container environments |

*Note: If `GEMINI_API_KEY` is omitted, the scanner automatically falls back to an intelligent, deterministic defensive rules engine.*

---

## 🔒 Security & Responsible Disclosure

WEBSCANNER is built strictly for **defensive security auditing, authorized vulnerability assessments, and educational reconnaissance**.
- It does **not** execute destructive exploits or denial-of-service tests.
- Probing is non-invasive (standard DNS queries, TLS handshakes, HTTP GET requests, and safe non-destructive socket checks).
- Built-in SSRF protections prevent queries to private internal subnets (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`, `172.16.0.0/12`).

---

## 📄 License

Distributed under the Apache 2.0 License. See `LICENSE` for more information.
