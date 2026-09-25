import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Container, Github, ExternalLink, BookOpen } from 'lucide-react';

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployModal: React.FC<DeployModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'docker' | 'local' | 'files'>('docker');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const dockerComposeSnippet = `# 1. Clone the repository from GitHub
git clone https://github.com/your-username/webscanner.git
cd webscanner

# 2. (Optional) Set up environment variables
cp .env.example .env
# Edit .env and insert your GEMINI_API_KEY if desired

# 3. Build and launch with Docker Compose
docker compose up -d --build

# 4. Access the scanner
http://localhost:3000`;

  const nodeSnippet = `# 1. Clone the repository
git clone https://github.com/your-username/webscanner.git
cd webscanner

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# Or build and launch for production
npm run build
npm start`;

  const dockerComposeYml = `services:
  webscanner:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: webscanner-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - NODE_ENV=production
      - GEMINI_API_KEY=\${GEMINI_API_KEY:-}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Container className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Deploy with Docker & GitHub</span>
              </h3>
              <p className="text-xs text-slate-400">
                Run WEBSCANNER locally in an isolated container or clone to GitHub.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/20 text-xs font-mono">
          <button
            onClick={() => setActiveTab('docker')}
            className={`pb-2.5 px-2 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'docker'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Container className="w-3.5 h-3.5" />
            <span>Docker Compose</span>
          </button>

          <button
            onClick={() => setActiveTab('local')}
            className={`pb-2.5 px-2 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'local'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Node.js / npm</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`pb-2.5 px-2 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'files'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>docker-compose.yml</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {activeTab === 'docker' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  Quick start instructions using Docker Compose:
                </span>
                <button
                  onClick={() => handleCopy('dockerSnippet', dockerComposeSnippet)}
                  className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer"
                >
                  {copiedKey === 'dockerSnippet' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Commands</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-200/90 overflow-x-auto leading-relaxed">
                <code>{dockerComposeSnippet}</code>
              </pre>

              <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/30 text-xs text-slate-300 flex items-start gap-2">
                <Github className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p>
                  Includes <code className="text-cyan-300">Dockerfile</code>, <code className="text-cyan-300">docker-compose.yml</code>, and <code className="text-cyan-300">README.md</code> in the repository root for zero-config container deployments.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'local' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  Clone from GitHub and run directly with Node.js:
                </span>
                <button
                  onClick={() => handleCopy('nodeSnippet', nodeSnippet)}
                  className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer"
                >
                  {copiedKey === 'nodeSnippet' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Commands</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-200/90 overflow-x-auto leading-relaxed">
                <code>{nodeSnippet}</code>
              </pre>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  Configuration inside <code className="text-cyan-300">docker-compose.yml</code>:
                </span>
                <button
                  onClick={() => handleCopy('ymlSnippet', dockerComposeYml)}
                  className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer"
                >
                  {copiedKey === 'ymlSnippet' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy YAML</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-200/90 overflow-x-auto leading-relaxed">
                <code>{dockerComposeYml}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>See README.md for full documentation</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
