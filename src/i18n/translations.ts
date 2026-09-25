export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh' | 'pt' | 'ar';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'es', label: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  { code: 'fr', label: 'French', nativeName: 'Français', dir: 'ltr' },
  { code: 'de', label: 'German', nativeName: 'Deutsch', dir: 'ltr' },
  { code: 'ja', label: 'Japanese', nativeName: '日本語', dir: 'ltr' },
  { code: 'zh', label: 'Chinese', nativeName: '简体中文', dir: 'ltr' },
  { code: 'pt', label: 'Portuguese', nativeName: 'Português', dir: 'ltr' },
  { code: 'ar', label: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
];

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  inputPlaceholder: string;
  aiAnalysisLabel: string;
  scanButton: string;
  scanningButton: string;
  sampleAudits: string;
  liveTelemetry: string;
  progressStep1: string;
  progressStep2: string;
  progressStep3: string;
  progressStep4: string;
  progressStep5: string;
  progressStep6: string;
  progressStep7: string;

  // Nav Tabs
  navOverview: string;
  navFlaws: string;
  navHeaders: string;
  navSslDns: string;
  navTechPorts: string;
  navExecutive: string;

  // Actions
  exportPdf: string;
  newAudit: string;
  viewSampleAudit: string;
  copySnippet: string;
  copied: string;

  // Overview
  targetAudit: string;
  securityScore: string;
  grade: string;
  strictHttps: string;
  httpNotRedirected: string;
  criticalRisk: string;
  highRisk: string;
  mediumRisk: string;
  lowRisk: string;
  passedChecks: string;

  // Flaws
  allSeverities: string;
  filterPlaceholder: string;
  noFlawsFound: string;
  techVulnerabilityAnalysis: string;
  exploitationImpact: string;
  evidenceFinding: string;
  recommendedRemediation: string;
  cvssScoreLabel: string;

  // Headers
  headersMatrixTitle: string;
  headersMatrixDesc: string;
  recommendationLabel: string;
  foundValue: string;

  // SSL & DNS
  sslAuditTitle: string;
  sslAuditDesc: string;
  certValid: string;
  certInvalid: string;
  daysRemaining: string;
  issuedOn: string;
  expiresOn: string;
  issuerCa: string;
  subjectCn: string;
  activeCipher: string;
  dnsEmailTitle: string;
  dnsEmailDesc: string;
  spfTitle: string;
  dmarcTitle: string;
  dnsRecordsTitle: string;
  cookieSecurityTitle: string;
  cookieSecurityDesc: string;

  // Tech & Ports
  techFingerprintTitle: string;
  techFingerprintDesc: string;
  knownCveAdvisories: string;
  portReconTitle: string;
  portReconDesc: string;
  robotsTxtTitle: string;
  securityTxtTitle: string;
  disallowedRoutes: string;

  // Executive
  cisoReportTitle: string;
  cisoReportDesc: string;
  executiveSummaryHeading: string;
  attackSurfaceHeading: string;
  threatPathwaysHeading: string;
  remediationRoadmapHeading: string;
  estimatedEffortLabel: string;
  complianceReadinessHeading: string;

  // Intro Cards
  deepVulnCardTitle: string;
  deepVulnCardDesc: string;
  aiThreatCardTitle: string;
  aiThreatCardDesc: string;
  exportPdfCardTitle: string;
  exportPdfCardDesc: string;
  sampleAuditBannerTitle: string;
  sampleAuditBannerDesc: string;
  instantDemoBadge: string;

  // Footer
  footerDisclaimer: string;
  footerRights: string;
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    appName: 'WEBSCANNER',
    tagline: 'DEEP VULNERABILITY AUDITOR & OSINT ANALYZER',
    heroTitle: 'Website Vulnerability & Security Scanner',
    heroSubtitle: 'Audit HTTP security headers, TLS/SSL cryptographic configuration, DNS records, SPF/DMARC posture, open ports, and generate executive PDF reports.',
    inputPlaceholder: 'Enter target URL or domain (e.g. https://target-site.com)',
    aiAnalysisLabel: 'AI Executive Analysis',
    scanButton: 'Scan Target',
    scanningButton: 'Scanning...',
    sampleAudits: 'Sample audits:',
    liveTelemetry: 'Live Telemetry',
    progressStep1: 'Initiating target domain resolution...',
    progressStep2: 'Resolving DNS zone records & mail servers...',
    progressStep3: 'Inspecting TLS certificate, validity & ciphers...',
    progressStep4: 'Auditing HTTP security headers & cookie policies...',
    progressStep5: 'Fingerprinting tech stack, CMS & CVE advisories...',
    progressStep6: 'Probing management ports & sensitive paths...',
    progressStep7: 'Synthesizing Executive Threat Analysis with Gemini...',

    navOverview: 'Overview',
    navFlaws: 'Flaws',
    navHeaders: 'HTTP Headers',
    navSslDns: 'SSL & DNS',
    navTechPorts: 'Tech & Ports',
    navExecutive: 'Executive Report',

    exportPdf: 'Export PDF',
    newAudit: 'New Audit',
    viewSampleAudit: 'View Sample Audit',
    copySnippet: 'Copy Snippet',
    copied: 'Copied',

    targetAudit: 'TARGET AUDIT',
    securityScore: 'SECURITY SCORE',
    grade: 'GRADE',
    strictHttps: 'Strict HTTPS',
    httpNotRedirected: 'HTTP Not Redirected',
    criticalRisk: 'Critical',
    highRisk: 'High Risk',
    mediumRisk: 'Medium',
    lowRisk: 'Low Risk',
    passedChecks: 'Passed',

    allSeverities: 'ALL',
    filterPlaceholder: 'Filter flaws by keyword or CVE...',
    noFlawsFound: 'No matching security flaws found',
    techVulnerabilityAnalysis: 'Technical Vulnerability Analysis',
    exploitationImpact: 'Exploitation Impact & Business Risk',
    evidenceFinding: 'Captured Evidence / Response Finding',
    recommendedRemediation: 'Recommended Remediation Directive',
    cvssScoreLabel: 'CVSS',

    headersMatrixTitle: 'HTTP Security Headers Matrix',
    headersMatrixDesc: 'Evaluates defense-in-depth headers recommended by OWASP to prevent XSS, Clickjacking, MIME confusion, and MitM attacks.',
    recommendationLabel: 'Recommendation',
    foundValue: 'Found Value',

    sslAuditTitle: 'TLS / SSL Cryptographic Audit',
    sslAuditDesc: 'Transport Layer Security handshake, certificate validity, and cipher suite parameters.',
    certValid: 'CERTIFICATE VALID',
    certInvalid: 'INVALID / UNTRUSTED',
    daysRemaining: 'Days Remaining',
    issuedOn: 'Issued On',
    expiresOn: 'Expires On',
    issuerCa: 'Certificate Authority',
    subjectCn: 'Subject Common Name',
    activeCipher: 'Active Cipher',
    dnsEmailTitle: 'DNS & Email Spoofing Defense',
    dnsEmailDesc: 'SPF, DMARC, and DNS zone records validation to guard against brand impersonation.',
    spfTitle: 'SPF (Sender Policy Framework)',
    dmarcTitle: 'DMARC Policy',
    dnsRecordsTitle: 'Resolved DNS Zone Records',
    cookieSecurityTitle: 'Cookie Security Flags',
    cookieSecurityDesc: 'Audits Secure, HttpOnly, and SameSite flags on session tokens.',

    techFingerprintTitle: 'Technology Fingerprint & CVE Vulnerability Alerts',
    techFingerprintDesc: 'Discovered web server, frameworks, content management systems, and associated advisories.',
    knownCveAdvisories: 'Known CVE Advisories',
    portReconTitle: 'Port & Network Service Reconnaissance',
    portReconDesc: 'Non-destructive socket connectivity checks for common management and database ports.',
    robotsTxtTitle: 'robots.txt Crawling Policy',
    securityTxtTitle: 'security.txt (RFC 9116)',
    disallowedRoutes: 'Disallowed Routes',

    cisoReportTitle: 'CISO Executive Security Briefing',
    cisoReportDesc: 'Synthesized risk evaluation and strategic threat analysis.',
    executiveSummaryHeading: 'Executive Summary',
    attackSurfaceHeading: 'External Attack Surface Assessment',
    threatPathwaysHeading: 'Primary Exploitation & Threat Pathways',
    remediationRoadmapHeading: 'Prioritized Tactical Remediation Roadmap',
    estimatedEffortLabel: 'Estimated Effort',
    complianceReadinessHeading: 'Security Compliance Readiness & Standards Mapping',

    deepVulnCardTitle: 'Deep Vulnerability Audit',
    deepVulnCardDesc: 'Identifies missing OWASP security headers, weak cipher suites, expired SSL certs, exposed admin paths, and open ports.',
    aiThreatCardTitle: 'AI Threat Analysis',
    aiThreatCardDesc: 'Synthesizes external attack surface findings into an executive CISO briefing with prioritized remediation playbooks.',
    exportPdfCardTitle: 'Exportable PDF Reports',
    exportPdfCardDesc: 'Generates vector-crisp, multi-page security audit reports with CVSS scoring, flaw summaries, and remediation code.',
    sampleAuditBannerTitle: 'Explore a Sample Security Audit',
    sampleAuditBannerDesc: 'Preview how WEBSCANNER categorizes flaws, generates remediation directives, and outputs downloadable PDF reports.',
    instantDemoBadge: 'Instant Demo',

    footerDisclaimer: 'Strictly for authorized security evaluation and defensive auditing.',
    footerRights: 'Automated Defensive Security Assessment & OSINT Audit Engine',
  },

  es: {
    appName: 'WEBSCANNER',
    tagline: 'AUDITOR DE VULNERABILIDADES Y ANÁLISIS OSINT',
    heroTitle: 'Escáner de Vulnerabilidades y Seguridad Web',
    heroSubtitle: 'Audite encabezados de seguridad HTTP, criptografía TLS/SSL, registros DNS, SPF/DMARC, puertos abiertos y genere informes ejecutivos en PDF.',
    inputPlaceholder: 'Ingrese URL o dominio objetivo (ej. https://sitio-objetivo.com)',
    aiAnalysisLabel: 'Análisis Ejecutivo con IA',
    scanButton: 'Escanear Objetivo',
    scanningButton: 'Escaneando...',
    sampleAudits: 'Auditorías de prueba:',
    liveTelemetry: 'Telemetría en Vivo',
    progressStep1: 'Iniciando resolución del dominio objetivo...',
    progressStep2: 'Resolviendo registros DNS y servidores de correo...',
    progressStep3: 'Inspeccionando certificado TLS, vigencia y cifrados...',
    progressStep4: 'Auditando encabezados de seguridad HTTP y cookies...',
    progressStep5: 'Identificando tecnologías, CMS y alertas CVE...',
    progressStep6: 'Sondeando puertos de gestión y rutas sensibles...',
    progressStep7: 'Sintetizando análisis ejecutivo de amenazas con Gemini...',

    navOverview: 'Resumen',
    navFlaws: 'Fallas',
    navHeaders: 'Encabezados HTTP',
    navSslDns: 'SSL y DNS',
    navTechPorts: 'Tecnología y Puertos',
    navExecutive: 'Informe Ejecutivo',

    exportPdf: 'Exportar PDF',
    newAudit: 'Nueva Auditoría',
    viewSampleAudit: 'Ver Auditoría de Prueba',
    copySnippet: 'Copiar Código',
    copied: 'Copiado',

    targetAudit: 'AUDITORÍA DEL OBJETIVO',
    securityScore: 'PUNTUACIÓN DE SEGURIDAD',
    grade: 'CALIFICACIÓN',
    strictHttps: 'HTTPS Estricto',
    httpNotRedirected: 'HTTP No Redirigido',
    criticalRisk: 'Crítico',
    highRisk: 'Riesgo Alto',
    mediumRisk: 'Medio',
    lowRisk: 'Riesgo Bajo',
    passedChecks: 'Aprobados',

    allSeverities: 'TODOS',
    filterPlaceholder: 'Filtrar fallas por palabra clave o CVE...',
    noFlawsFound: 'No se encontraron fallas de seguridad coincidentes',
    techVulnerabilityAnalysis: 'Análisis Técnico de la Vulnerabilidad',
    exploitationImpact: 'Impacto de Explotación y Riesgo Empresarial',
    evidenceFinding: 'Evidencia Capturada / Hallazgo',
    recommendedRemediation: 'Directiva de Corrección Recomendada',
    cvssScoreLabel: 'CVSS',

    headersMatrixTitle: 'Matriz de Encabezados de Seguridad HTTP',
    headersMatrixDesc: 'Evalúa encabezados de defensa en profundidad según OWASP contra XSS, Clickjacking y ataques MitM.',
    recommendationLabel: 'Recomendación',
    foundValue: 'Valor Encontrado',

    sslAuditTitle: 'Auditoría Criptográfica TLS / SSL',
    sslAuditDesc: 'Verificación del apretón de manos TLS, validez del certificado y conjuntos de cifrado.',
    certValid: 'CERTIFICADO VÁLIDO',
    certInvalid: 'INVÁLIDO / NO CONFIABLE',
    daysRemaining: 'Días Restantes',
    issuedOn: 'Emitido el',
    expiresOn: 'Expira el',
    issuerCa: 'Autoridad Certificadora',
    subjectCn: 'Nombre Común (CN)',
    activeCipher: 'Cifrado Activo',
    dnsEmailTitle: 'Defensa DNS y Contra Suplantación de Correo',
    dnsEmailDesc: 'Validación de registros SPF, DMARC y DNS para evitar la suplantación de identidad.',
    spfTitle: 'SPF (Sender Policy Framework)',
    dmarcTitle: 'Política DMARC',
    dnsRecordsTitle: 'Registros de Zona DNS Resueltos',
    cookieSecurityTitle: 'Banderas de Seguridad en Cookies',
    cookieSecurityDesc: 'Audita indicadores Secure, HttpOnly y SameSite en tokens de sesión.',

    techFingerprintTitle: 'Huella Tecnológica y Alertas de Vulnerabilidad CVE',
    techFingerprintDesc: 'Servidores web detectados, frameworks, CMS y avisos de seguridad asociados.',
    knownCveAdvisories: 'Avisos CVE Conocidos',
    portReconTitle: 'Reconocimiento de Puertos y Servicios de Red',
    portReconDesc: 'Comprobaciones no destructivas de conectividad para puertos de gestión y bases de datos.',
    robotsTxtTitle: 'Política de Rastreo robots.txt',
    securityTxtTitle: 'security.txt (RFC 9116)',
    disallowedRoutes: 'Rutas Restringidas',

    cisoReportTitle: 'Informe Ejecutivo de Seguridad CISO',
    cisoReportDesc: 'Evaluación sintética de riesgos y análisis estratégico de amenazas.',
    executiveSummaryHeading: 'Resumen Ejecutivo',
    attackSurfaceHeading: 'Evaluación de Superficie de Ataque Externa',
    threatPathwaysHeading: 'Vías Principales de Explotación y Amenazas',
    remediationRoadmapHeading: 'Hoja de Ruta Táctica de Corrección Priorizada',
    estimatedEffortLabel: 'Esfuerzo Estimado',
    complianceReadinessHeading: 'Alineación de Cumplimiento y Normativas de Seguridad',

    deepVulnCardTitle: 'Auditoría Profunda de Vulnerabilidades',
    deepVulnCardDesc: 'Detecta encabezados OWASP faltantes, cifrados débiles, certificados caducados y puertos expuestos.',
    aiThreatCardTitle: 'Análisis de Amenazas con IA',
    aiThreatCardDesc: 'Sintetiza la superficie de ataque en un informe CISO con planes de acción priorizados.',
    exportPdfCardTitle: 'Informes en PDF Exportables',
    exportPdfCardDesc: 'Genera informes vectoriales nítidos con puntuaciones CVSS y código de corrección listo para usar.',
    sampleAuditBannerTitle: 'Explorar una Auditoría de Prueba',
    sampleAuditBannerDesc: 'Descubra cómo WEBSCANNER clasifica las fallas y genera directivas de mitigación.',
    instantDemoBadge: 'Demostración Instantánea',

    footerDisclaimer: 'Uso estrictamente autorizado para evaluación de seguridad defensiva y auditoría.',
    footerRights: 'Motor de Evaluación de Seguridad Defensiva y Análisis OSINT',
  },

  fr: {
    appName: 'WEBSCANNER',
    tagline: 'AUDITEUR DE VULNÉRABILITÉS ET ANALYSEUR OSINT',
    heroTitle: 'Scanner de Vulnérabilités et Sécurité Web',
    heroSubtitle: 'Auditez les en-têtes de sécurité HTTP, le chiffrement TLS/SSL, les enregistrements DNS, SPF/DMARC, les ports ouverts et exportez des rapports PDF exécutifs.',
    inputPlaceholder: 'Entrez une URL ou un domaine cible (ex. https://site-cible.com)',
    aiAnalysisLabel: 'Analyse Décisionnelle par IA',
    scanButton: 'Scanner la Cible',
    scanningButton: 'Analyse en cours...',
    sampleAudits: 'Audits d’exemple :',
    liveTelemetry: 'Télémétrie en Direct',
    progressStep1: 'Résolution initiale du domaine cible...',
    progressStep2: 'Résolution des enregistrements DNS et serveurs mail...',
    progressStep3: 'Inspection du certificat TLS, validité et suites cryptographiques...',
    progressStep4: 'Audit des en-têtes HTTP de sécurité et des cookies...',
    progressStep5: 'Empreinte des technologies, CMS et alertes CVE...',
    progressStep6: 'Sondage des ports d’administration et chemins sensibles...',
    progressStep7: 'Synthèse de l’analyse des menaces avec Gemini...',

    navOverview: 'Vue d’ensemble',
    navFlaws: 'Vulnérabilités',
    navHeaders: 'En-têtes HTTP',
    navSslDns: 'SSL & DNS',
    navTechPorts: 'Tech & Ports',
    navExecutive: 'Rapport Exécutif',

    exportPdf: 'Exporter en PDF',
    newAudit: 'Nouvel Audit',
    viewSampleAudit: 'Voir un Exemple',
    copySnippet: 'Copier l’Extrait',
    copied: 'Copié',

    targetAudit: 'AUDIT DE LA CIBLE',
    securityScore: 'SCORE DE SÉCURITÉ',
    grade: 'NOTE',
    strictHttps: 'HTTPS Strict',
    httpNotRedirected: 'HTTP Non Redirigé',
    criticalRisk: 'Critique',
    highRisk: 'Risque Élevé',
    mediumRisk: 'Moyen',
    lowRisk: 'Risque Faible',
    passedChecks: 'Validés',

    allSeverities: 'TOUS',
    filterPlaceholder: 'Filtrer par mot-clé ou CVE...',
    noFlawsFound: 'Aucune vulnérabilité correspondante détectée',
    techVulnerabilityAnalysis: 'Analyse Technique de la Vulnérabilité',
    exploitationImpact: 'Impact d’Exploitation et Risque Métier',
    evidenceFinding: 'Preuve Recueillie / Constat',
    recommendedRemediation: 'Directive de Remédiation Recommandée',
    cvssScoreLabel: 'CVSS',

    headersMatrixTitle: 'Matrice des En-têtes de Sécurité HTTP',
    headersMatrixDesc: 'Évalue les en-têtes de défense en profondeur recommandés par l’OWASP.',
    recommendationLabel: 'Recommandation',
    foundValue: 'Valeur Trouvée',

    sslAuditTitle: 'Audit Cryptographique TLS / SSL',
    sslAuditDesc: 'Négociation TLS, validité du certificat et paramètres de chiffrement.',
    certValid: 'CERTIFICAT VALIDE',
    certInvalid: 'INVALIDE / NON FIABLE',
    daysRemaining: 'Jours Restants',
    issuedOn: 'Émis le',
    expiresOn: 'Expire le',
    issuerCa: 'Autorité de Certification',
    subjectCn: 'Nom Commun (CN)',
    activeCipher: 'Chiffrement Actif',
    dnsEmailTitle: 'Défense DNS et Protection Anti-Usurpation Email',
    dnsEmailDesc: 'Validation des protocoles SPF, DMARC et de la zone DNS.',
    spfTitle: 'SPF (Sender Policy Framework)',
    dmarcTitle: 'Politique DMARC',
    dnsRecordsTitle: 'Enregistrements de Zone DNS Résolus',
    cookieSecurityTitle: 'Attributs de Sécurité des Cookies',
    cookieSecurityDesc: 'Contrôle des drapeaux Secure, HttpOnly et SameSite.',

    techFingerprintTitle: 'Empreinte Technologique et Alertes CVE',
    techFingerprintDesc: 'Identification du serveur web, des frameworks et CMS.',
    knownCveAdvisories: 'Avis CVE Connus',
    portReconTitle: 'Reconnaissance des Ports et Services Réseau',
    portReconDesc: 'Vérifications non destructives pour les ports d’administration et bases de données.',
    robotsTxtTitle: 'Politique d’Indexation robots.txt',
    securityTxtTitle: 'security.txt (RFC 9116)',
    disallowedRoutes: 'Chemins Interdits',

    cisoReportTitle: 'Synthèse Exécutive de Sécurité (CISO)',
    cisoReportDesc: 'Évaluation des risques et analyse stratégique des menaces.',
    executiveSummaryHeading: 'Résumé Exécutif',
    attackSurfaceHeading: 'Évaluation de la Surface d’Attaque Externe',
    threatPathwaysHeading: 'Vecteurs Principaux d’Exploitation',
    remediationRoadmapHeading: 'Feuille de Route Tactique Priorisée',
    estimatedEffortLabel: 'Effort Estimé',
    complianceReadinessHeading: 'Conformité et Alignement sur les Référentiels',

    deepVulnCardTitle: 'Audit Approfondi des Vulnérabilités',
    deepVulnCardDesc: 'Détecte les en-têtes manquants, protocoles obsolètes et fichiers sensibles exposés.',
    aiThreatCardTitle: 'Analyse des Menaces par IA',
    aiThreatCardDesc: 'Synthétise la surface d’attaque en un briefing stratégique avec plan d’action.',
    exportPdfCardTitle: 'Rapports PDF Exportables',
    exportPdfCardDesc: 'Génère des rapports professionnels détaillés prêts à l’impression.',
    sampleAuditBannerTitle: 'Explorer un Audit d’Exemple',
    sampleAuditBannerDesc: 'Visualisez la façon dont WEBSCANNER classe les failles et fournit les corrections.',
    instantDemoBadge: 'Démo Immédiate',

    footerDisclaimer: 'Usage strictement réservé aux évaluations autorisées et à la cyberdéfense.',
    footerRights: 'Moteur d’Audit de Sécurité Défensive et d’Analyse OSINT',
  },

  de: {
    appName: 'WEBSCANNER',
    tagline: 'TIEFEN-SCHWACHSTELLEN-AUDIT & OSINT-ANALYSE',
    heroTitle: 'Website-Schwachstellen- & Sicherheits-Scanner',
    heroSubtitle: 'Überprüfen Sie HTTP-Sicherheits-Header, TLS/SSL-Kryptografie, DNS-Einträge, SPF/DMARC, offene Ports und erstellen Sie PDF-Auditberichte.',
    inputPlaceholder: 'Ziel-URL oder Domain eingeben (z.B. https://ziel-seite.de)',
    aiAnalysisLabel: 'KI-Sicherheitsanalyse',
    scanButton: 'Ziel Scannen',
    scanningButton: 'Scan läuft...',
    sampleAudits: 'Beispiel-Audits:',
    liveTelemetry: 'Live-Telemetrie',
    progressStep1: 'Starte Domain-Namensauflösung...',
    progressStep2: 'Löse DNS-Einträge und Mailserver auf...',
    progressStep3: 'Prüfe TLS-Zertifikat, Gültigkeit und Verschlüsselungssuiten...',
    progressStep4: 'Prüfe HTTP-Sicherheits-Header und Cookie-Richtlinien...',
    progressStep5: 'Erkenne Technologie-Stack, CMS und CVE-Warnungen...',
    progressStep6: 'Untersuche Verwaltungs-Ports und sensible Pfade...',
    progressStep7: 'Erstelle Bedrohungsanalyse mit Gemini...',

    navOverview: 'Übersicht',
    navFlaws: 'Schwachstellen',
    navHeaders: 'HTTP-Header',
    navSslDns: 'SSL & DNS',
    navTechPorts: 'Technologie & Ports',
    navExecutive: 'Management-Bericht',

    exportPdf: 'PDF Exportieren',
    newAudit: 'Neuer Scan',
    viewSampleAudit: 'Beispiel Ansehen',
    copySnippet: 'Code Kopieren',
    copied: 'Kopiert',

    targetAudit: 'ZIEL-AUDIT',
    securityScore: 'SICHERHEITS-PUNKTE',
    grade: 'NOTE',
    strictHttps: 'Strikte HTTPS-Umleitung',
    httpNotRedirected: 'HTTP Nicht Umgeleitet',
    criticalRisk: 'Kritisch',
    highRisk: 'Hohes Risiko',
    mediumRisk: 'Mittel',
    lowRisk: 'Gering',
    passedChecks: 'Bestanden',

    allSeverities: 'ALLE',
    filterPlaceholder: 'Schwachstellen nach Stichwort oder CVE filtern...',
    noFlawsFound: 'Keine passenden Schwachstellen gefunden',
    techVulnerabilityAnalysis: 'Technische Schwachstellenanalyse',
    exploitationImpact: 'Ausnutzungsrisiko & Geschäftsauswirkung',
    evidenceFinding: 'Erfasste Beweise / Befund',
    recommendedRemediation: 'Empfohlene Behebungsmaßnahme',
    cvssScoreLabel: 'CVSS',

    headersMatrixTitle: 'Matrix der HTTP-Sicherheits-Header',
    headersMatrixDesc: 'Überprüft empfohlene Abwehr-Header gegen XSS, Clickjacking und MitM-Angriffe.',
    recommendationLabel: 'Empfehlung',
    foundValue: 'Gefundener Wert',

    sslAuditTitle: 'TLS/SSL-Kryptografie-Audit',
    sslAuditDesc: 'Handshake-Überprüfung, Zertifikatslaufzeit und Cipher-Suiten.',
    certValid: 'ZERTIFIKAT GÜLTIG',
    certInvalid: 'UNGÜLTIG / NICHT VERTRAUT',
    daysRemaining: 'Verbleibende Tage',
    issuedOn: 'Ausgestellt am',
    expiresOn: 'Gültig bis',
    issuerCa: 'Zertifizierungsstelle',
    subjectCn: 'Common Name (CN)',
    activeCipher: 'Aktive Chiffre',
    dnsEmailTitle: 'DNS & E-Mail-Spoofing-Schutz',
    dnsEmailDesc: 'Validierung von SPF, DMARC und DNS-Einträgen gegen E-Mail-Identitätsdiebstahl.',
    spfTitle: 'SPF (Sender Policy Framework)',
    dmarcTitle: 'DMARC-Richtlinie',
    dnsRecordsTitle: 'Aufgelöste DNS-Zoneneinträge',
    cookieSecurityTitle: 'Cookie-Sicherheitsflags',
    cookieSecurityDesc: 'Prüfung auf Secure-, HttpOnly- und SameSite-Attribute bei Session-Cookies.',

    techFingerprintTitle: 'Technologie-Fingerabdruck & CVE-Warnungen',
    techFingerprintDesc: 'Erkannte Webserver, Frameworks, Content-Management-Systeme.',
    knownCveAdvisories: 'Bekannte CVE-Meldungen',
    portReconTitle: 'Port- & Netzwerkdienst-Erkundung',
    portReconDesc: 'Zerstörungsfreie Verbindungsprüfungen für Management- und Datenbank-Ports.',
    robotsTxtTitle: 'robots.txt Crawling-Richtlinie',
    securityTxtTitle: 'security.txt (RFC 9116)',
    disallowedRoutes: 'Gesperrte Pfade',

    cisoReportTitle: 'CISO Management-Sicherheitsbericht',
    cisoReportDesc: 'Synthetisierte Risikobewertung und strategische Bedrohungsanalyse.',
    executiveSummaryHeading: 'Zusammenfassung für Führungskräfte',
    attackSurfaceHeading: 'Bewertung der externen Angriffsfläche',
    threatPathwaysHeading: 'Hauptsächliche Angriffs- & Bedrohungsvektoren',
    remediationRoadmapHeading: 'Priorisierte taktische Behebungs-Roadmap',
    estimatedEffortLabel: 'Geschätzter Aufwand',
    complianceReadinessHeading: 'Sicherheits-Compliance & Standard-Abgleich',

    deepVulnCardTitle: 'Gründliches Schwachstellen-Audit',
    deepVulnCardDesc: 'Erkennt fehlende Sicherheits-Header, schwache Chiffren und exponierte Ports.',
    aiThreatCardTitle: 'KI-Bedrohungsanalyse',
    aiThreatCardDesc: 'Erstellt strategische Risikoberichte mit priorisierten Maßnahmenplänen.',
    exportPdfCardTitle: 'Exportierbare PDF-Berichte',
    exportPdfCardDesc: 'Erzeugt professionelle Vektor-PDF-Berichte mit CVSS-Bewertungen.',
    sampleAuditBannerTitle: 'Beispiel-Audit Erkunden',
    sampleAuditBannerDesc: 'Sehen Sie, wie WEBSCANNER Schwachstellen einstuft und Handlungsempfehlungen liefert.',
    instantDemoBadge: 'Sofort-Demo',

    footerDisclaimer: 'Ausschließlich für autorisierte defensive Sicherheitsprüfungen bestimmt.',
    footerRights: 'Defensives Sicherheits-Audit- & OSINT-System',
  },

  ja: {
    appName: 'WEBSCANNER',
    tagline: '脆弱性診断＆OSINTセキュリティ監査エンジン',
    heroTitle: 'Webサイト脆弱性・セキュリティ診断スキャナー',
    heroSubtitle: 'HTTPセキュリティヘッダー、TLS/SSL証明書暗号構成、DNSレコード、SPF/DMARC、公開ポートを診断し、エグゼクティブ向けPDFレポートを出力します。',
    inputPlaceholder: '対象のURLまたはドメインを入力 (例: https://example.com)',
    aiAnalysisLabel: 'AIエグゼクティブ診断',
    scanButton: '診断開始',
    scanningButton: '診断中...',
    sampleAudits: 'サンプル診断:',
    liveTelemetry: 'リアルタイム進捗',
    progressStep1: '対象ドメインの名前解決を開始...',
    progressStep2: 'DNSゾーンレコードおよびMXサーバーを検証中...',
    progressStep3: 'TLS証明書・有効期限・暗号スイートを検証中...',
    progressStep4: 'HTTPセキュリティヘッダーおよびCookie設定を監査中...',
    progressStep5: 'サーバー技術・CMS・CVE脆弱性情報を照合中...',
    progressStep6: '管理ポートおよび機密エンドポイントを調査中...',
    progressStep7: 'Gemini AIによる脅威分析レポートを生成中...',

    navOverview: '概要',
    navFlaws: '脆弱性',
    navHeaders: 'HTTPヘッダー',
    navSslDns: 'SSL & DNS',
    navTechPorts: '技術 & ポート',
    navExecutive: '診断レポート',

    exportPdf: 'PDF出力',
    newAudit: '新規診断',
    viewSampleAudit: 'サンプル表示',
    copySnippet: 'コードをコピー',
    copied: 'コピー完了',

    targetAudit: '診断対象',
    securityScore: 'セキュリティスコア',
    grade: '評価グレード',
    strictHttps: '常時HTTPS化',
    httpNotRedirected: 'HTTP転送未設定',
    criticalRisk: '緊急',
    highRisk: '高リスク',
    mediumRisk: '中リスク',
    lowRisk: '低リスク',
    passedChecks: '合格項目',

    allSeverities: 'すべて',
    filterPlaceholder: 'キーワードまたはCVEで絞り込み...',
    noFlawsFound: '該当するセキュリティ上の欠陥は見つかりませんでした',
    techVulnerabilityAnalysis: '技術的脆弱性分析',
    exploitationImpact: '悪用時の影響とビジネスリスク',
    evidenceFinding: '検出された証跡・レスポンス内容',
    recommendedRemediation: '推奨される修正対策',
    cvssScoreLabel: 'CVSS',

    headersMatrixTitle: 'HTTPセキュリティヘッダー診断一覧',
    headersMatrixDesc: 'OWASPが推奨するXSS、クリックジャッキング、MitM対策ヘッダーを評価します。',
    recommendationLabel: '推奨設定',
    foundValue: '検出された値',

    sslAuditTitle: 'TLS / SSL暗号化監査',
    sslAuditDesc: '暗号化通信のハンドシェイク、証明書の有効期限、暗号スイートの安全性を診断します。',
    certValid: '証明書は有効です',
    certInvalid: '無効または信頼されていません',
    daysRemaining: '有効期限残り日数',
    issuedOn: '発行日',
    expiresOn: '満了日',
    issuerCa: '認証局 (CA)',
    subjectCn: 'コモンネーム (CN)',
    activeCipher: '使用暗号スイート',
    dnsEmailTitle: 'DNS & メールなりすまし防止対策',
    dnsEmailDesc: 'SPF、DMARC、DNSレコードを検証し、ドメインなりすましリスクを監査します。',
    spfTitle: 'SPF (送信者ポリシーフレームワーク)',
    dmarcTitle: 'DMARCポリシー',
    dnsRecordsTitle: '解決されたDNSゾーンレコード',
    cookieSecurityTitle: 'Cookieセキュリティフラグ',
    cookieSecurityDesc: 'セッショントークンのSecure、HttpOnly、SameSite属性を検証します。',

    techFingerprintTitle: '技術スタック検出 & CVE脆弱性アラート',
    techFingerprintDesc: '検出されたWebサーバー、フレームワーク、CMSおよび既知のセキュリティ情報。',
    knownCveAdvisories: '既知のCVE情報',
    portReconTitle: '公開ポート＆ネットワークサービス調査',
    portReconDesc: '管理ポートやデータベースポートの外部露出を非破壊で調査します。',
    robotsTxtTitle: 'robots.txt クロールポリシー',
    securityTxtTitle: 'security.txt (RFC 9116)',
    disallowedRoutes: '非公開パス',

    cisoReportTitle: 'CISOエグゼクティブ・セキュリティブリーフィング',
    cisoReportDesc: '総合的なリスク評価および戦略的脅威分析。',
    executiveSummaryHeading: 'エグゼクティブサマリー',
    attackSurfaceHeading: '外部アタックサーフェス評価',
    threatPathwaysHeading: '想定される攻撃シナリオ・侵入経路',
    remediationRoadmapHeading: '優先度付き改善ロードマップ',
    estimatedEffortLabel: '想定工数',
    complianceReadinessHeading: 'セキュリティコンプライアンス準拠状況',

    deepVulnCardTitle: '詳細な脆弱性監査',
    deepVulnCardDesc: '欠落しているヘッダー、弱い暗号方式、公開ポートを精密に特定します。',
    aiThreatCardTitle: 'AIによる脅威分析',
    aiThreatCardDesc: '外部リスクを統合し、優先度付きの是正プランを策定します。',
    exportPdfCardTitle: 'PDFレポート即時生成',
    exportPdfCardDesc: 'CVSSスコアや修正設定コードを含む本格的な診断報告書をダウンロード可能。',
    sampleAuditBannerTitle: 'サンプル診断結果を確認',
    sampleAuditBannerDesc: 'WEBSCANNERの診断レポートや修復ガイダンスの表示例を確認できます。',
    instantDemoBadge: '即時プレビュー',

    footerDisclaimer: '本システムは認可されたセキュリティ監査および防御目的でのみご利用ください。',
    footerRights: '防御的セキュリティ診断およびOSINT監査エンジン',
  },

  zh: {
    appName: 'WEBSCANNER',
    tagline: '深度网站漏洞审计与OSINT分析引擎',
    heroTitle: '网站漏洞扫描与安全评估工具',
    heroSubtitle: '全面审计 HTTP 安全标头、TLS/SSL 密码学配置、DNS 记录、SPF/DMARC 邮件防伪策略、开放端口，并一键导出专业 PDF 审计报告。',
    inputPlaceholder: '输入目标网址或域名（例如：https://example.com）',
    aiAnalysisLabel: 'AI 深度安全简报',
    scanButton: '开始扫描',
    scanningButton: '正在扫描...',
    sampleAudits: '示例检测：',
    liveTelemetry: '实时遥测',
    progressStep1: '正在解析目标域名网络记录...',
    progressStep2: '正在验证 DNS 区域解析与邮件服务器...',
    progressStep3: '正在检查 TLS 证书、有效期及加密套件...',
    progressStep4: '正在审计 HTTP 安全标头与 Cookie 属性...',
    progressStep5: '正在识别服务端架构、CMS 及 CVE 漏洞库...',
    progressStep6: '正在探测服务端口与敏感文件暴露...',
    progressStep7: '正在使用 Gemini AI 生成高管威胁简报...',

    navOverview: '概览',
    navFlaws: '漏洞列表',
    navHeaders: 'HTTP 标头',
    navSslDns: 'SSL 与 DNS',
    navTechPorts: '技术与端口',
    navExecutive: '高管报告',

    exportPdf: '导出 PDF',
    newAudit: '新建检测',
    viewSampleAudit: '查看示例报告',
    copySnippet: '复制代码',
    copied: '已复制',

    targetAudit: '目标审计',
    securityScore: '安全评分',
    grade: '安全等级',
    strictHttps: '强制 HTTPS',
    httpNotRedirected: '未配置 HTTP 跳转',
    criticalRisk: '严重',
    highRisk: '高危',
    mediumRisk: '中危',
    lowRisk: '低危',
    passedChecks: '通过项',

    allSeverities: '全部',
    filterPlaceholder: '按关键词或 CVE 筛选漏洞...',
    noFlawsFound: '未发现匹配的安全缺陷',
    techVulnerabilityAnalysis: '技术漏洞深度解析',
    exploitationImpact: '利用后果与业务风险',
    evidenceFinding: '捕获凭据与响应证据',
    recommendedRemediation: '推荐修复措施与配置',
    cvssScoreLabel: 'CVSS',

    headersMatrixTitle: 'HTTP 安全标头检测矩阵',
    headersMatrixDesc: '评估 OWASP 推荐的纵深防御标头，防御 XSS、点击劫持和中间人攻击。',
    recommendationLabel: '整改建议',
    foundValue: '当前返回值',

    sslAuditTitle: 'TLS / SSL 密码学与证书审计',
    sslAuditDesc: '传输层安全握手、证书有效期及加密套件强度检测。',
    certValid: '证书有效',
    certInvalid: '证书无效 / 不受信任',
    daysRemaining: '剩余有效天数',
    issuedOn: '签发日期',
    expiresOn: '到期日期',
    issuerCa: '证书颁发机构 (CA)',
    subjectCn: '主体公用名 (CN)',
    activeCipher: '当前握手密码套件',
    dnsEmailTitle: 'DNS 与邮件仿冒防范审计',
    dnsEmailDesc: '检测 SPF、DMARC 及 DNS 解析记录，防止域名仿冒和钓鱼欺诈。',
    spfTitle: 'SPF 记录策略',
    dmarcTitle: 'DMARC 邮件安全策略',
    dnsRecordsTitle: '已解析 DNS 区域记录',
    cookieSecurityTitle: 'Cookie 安全标志审计',
    cookieSecurityDesc: '审计会话凭证中的 Secure、HttpOnly 和 SameSite 保护属性。',

    techFingerprintTitle: '技术栈指纹与已知 CVE 警报',
    techFingerprintDesc: '识别网站 Web 服务器、后端框架、CMS 系统及相关安全公告。',
    knownCveAdvisories: '已知 CVE 公告',
    portReconTitle: '网络端口与对外服务探测',
    portReconDesc: '非破坏性连通性探测，防止数据库或敏感运维管理端口对外暴露。',
    robotsTxtTitle: 'robots.txt 爬虫抓取规则',
    securityTxtTitle: 'security.txt 安全政策 (RFC 9116)',
    disallowedRoutes: '限制访问路径',

    cisoReportTitle: 'CISO 首席信息安全官执行简报',
    cisoReportDesc: '系统化风险综合评估与战略级威胁分析。',
    executiveSummaryHeading: '管理层摘要',
    attackSurfaceHeading: '外部攻击面整体评估',
    threatPathwaysHeading: '核心攻击路径与威胁场景',
    remediationRoadmapHeading: '分级整改实施路线图',
    estimatedEffortLabel: '预计工作量',
    complianceReadinessHeading: '合规标准对照与满足情况',

    deepVulnCardTitle: '深度漏洞发现',
    deepVulnCardDesc: '精准检测缺失安全标头、弱加密套件、过期证书及暴露路径。',
    aiThreatCardTitle: 'AI 威胁综合评估',
    aiThreatCardDesc: '整合外部攻击面，生成具前瞻性与可落地的整改排期。',
    exportPdfCardTitle: '生成并导出 PDF 报告',
    exportPdfCardDesc: '输出排版精美、数据详尽的多页专业安全审计报告。',
    sampleAuditBannerTitle: '浏览示例漏洞审计报告',
    sampleAuditBannerDesc: '预览 WEBSCANNER 的缺陷归类、修补配置与完整报告导出效果。',
    instantDemoBadge: '即时演示',

    footerDisclaimer: '本工具仅限用于经合法授权的安全评估与防御性加固测试。',
    footerRights: '自动化防御安全评估与开源网络情报审计引擎',
  },

  pt: {
    appName: 'WEBSCANNER',
    tagline: 'AUDITOR DE VULNERABILIDADES E ANÁLISE OSINT',
    heroTitle: 'Scanner de Vulnerabilidades e Segurança Web',
    heroSubtitle: 'Audite cabeçalhos HTTP, criptografia TLS/SSL, registros DNS, SPF/DMARC, portas abertas e gere relatórios executivos em PDF.',
    inputPlaceholder: 'Digite a URL ou domínio alvo (ex.: https://site-alvo.com)',
    aiAnalysisLabel: 'Análise Executiva com IA',
    scanButton: 'Escanear Alvo',
    scanningButton: 'Escaneando...',
    sampleAudits: 'Auditorias de exemplo:',
    liveTelemetry: 'Telemetria em Tempo Real',
    progressStep1: 'Iniciando resolução do domínio alvo...',
    progressStep2: 'Resolvendo registros DNS e servidores de e-mail...',
    progressStep3: 'Inspecionando certificado TLS, validade e cifras...',
    progressStep4: 'Auditando cabeçalhos de segurança HTTP e cookies...',
    progressStep5: 'Identificando tecnologias, CMS e vulnerabilidades CVE...',
    progressStep6: 'Verificando portas de gerenciamento e caminhos sensíveis...',
    progressStep7: 'Sintetizando relatório de ameaças com Gemini AI...',

    navOverview: 'Visão Geral',
    navFlaws: 'Falhas',
    navHeaders: 'Cabeçalhos HTTP',
    navSslDns: 'SSL e DNS',
    navTechPorts: 'Tecnologia e Portas',
    navExecutive: 'Relatório Executivo',

    exportPdf: 'Exportar PDF',
    newAudit: 'Nova Auditoria',
    viewSampleAudit: 'Ver Exemplo',
    copySnippet: 'Copiar Código',
    copied: 'Copiado',

    targetAudit: 'AUDITORIA DO ALVO',
    securityScore: 'PONTUAÇÃO DE SEGURANÇA',
    grade: 'NOTA',
    strictHttps: 'HTTPS Estrito',
    httpNotRedirected: 'HTTP Não Redirecionado',
    criticalRisk: 'Crítico',
    highRisk: 'Alto Risco',
    mediumRisk: 'Médio',
    lowRisk: 'Baixo Risco',
    passedChecks: 'Aprovados',

    allSeverities: 'TODOS',
    filterPlaceholder: 'Filtrar falhas por palavra-chave ou CVE...',
    noFlawsFound: 'Nenhuma falha de segurança correspondente encontrada',
    techVulnerabilityAnalysis: 'Análise Técnica da Vulnerabilidade',
    exploitationImpact: 'Impacto de Exploração e Risco ao Negócio',
    evidenceFinding: 'Evidência Capturada / Resposta',
    recommendedRemediation: 'Diretiva de Correção Recomendada',
    cvssScoreLabel: 'CVSS',

    headersMatrixTitle: 'Matriz de Cabeçalhos de Segurança HTTP',
    headersMatrixDesc: 'Avalia cabeçalhos de defesa em profundidade recomendados pela OWASP contra XSS, Clickjacking e ataques MitM.',
    recommendationLabel: 'Recomendação',
    foundValue: 'Valor Encontrado',

    sslAuditTitle: 'Auditoria Criptográfica TLS / SSL',
    sslAuditDesc: 'Verificação do handshake TLS, validade do certificado e suítes de cifras.',
    certValid: 'CERTIFICADO VÁLIDO',
    certInvalid: 'INVÁLIDO / NÃO CONFIÁVEL',
    daysRemaining: 'Dias Restantes',
    issuedOn: 'Emitido em',
    expiresOn: 'Expira em',
    issuerCa: 'Autoridade Certificadora',
    subjectCn: 'Nome Comum (CN)',
    activeCipher: 'Cifra Ativa',
    dnsEmailTitle: 'Defesa DNS e Contra Spoofing de E-mail',
    dnsEmailDesc: 'Validação de SPF, DMARC e registros DNS para evitar personificação de marca.',
    spfTitle: 'SPF (Sender Policy Framework)',
    dmarcTitle: 'Política DMARC',
    dnsRecordsTitle: 'Registros da Zona DNS Resolvidos',
    cookieSecurityTitle: 'Sinalizadores de Segurança em Cookies',
    cookieSecurityDesc: 'Audita sinalizadores Secure, HttpOnly e SameSite em tokens de sessão.',

    techFingerprintTitle: 'Fingerprint Tecnológico e Alertas CVE',
    techFingerprintDesc: 'Servidores web detectados, frameworks, CMS e alertas associados.',
    knownCveAdvisories: 'Avisos de CVE Conhecidos',
    portReconTitle: 'Reconhecimento de Portas e Serviços de Rede',
    portReconDesc: 'Testes não destrutivos de conectividade para portas de bancos de dados e gerenciamento.',
    robotsTxtTitle: 'Política de Rastreamento robots.txt',
    securityTxtTitle: 'security.txt (RFC 9116)',
    disallowedRoutes: 'Rotas Proibidas',

    cisoReportTitle: 'Briefing Executivo de Segurança (CISO)',
    cisoReportDesc: 'Avaliação sintética de riscos e análise estratégica de ameaças.',
    executiveSummaryHeading: 'Resumo Executivo',
    attackSurfaceHeading: 'Avaliação da Superfície de Ataque Externa',
    threatPathwaysHeading: 'Principais Vetores de Exploração e Ameaças',
    remediationRoadmapHeading: 'Plano Tático de Correção Priorizado',
    estimatedEffortLabel: 'Esforço Estimado',
    complianceReadinessHeading: 'Alinhamento com Normas de Conformidade',

    deepVulnCardTitle: 'Auditoria Profunda de Vulnerabilidades',
    deepVulnCardDesc: 'Identifica cabeçalhos ausentes, cifras fracas, certificados expirados e portas expostas.',
    aiThreatCardTitle: 'Análise de Ameaças com IA',
    aiThreatCardDesc: 'Sintetiza a superfície de ataque em um briefing CISO com planos prioritários.',
    exportPdfCardTitle: 'Relatórios em PDF Exportáveis',
    exportPdfCardDesc: 'Gera relatórios profissionais detalhados com pontuação CVSS e código pronto para uso.',
    sampleAuditBannerTitle: 'Explorar Auditoria de Exemplo',
    sampleAuditBannerDesc: 'Veja como o WEBSCANNER classifica falhas e fornece instruções de correção.',
    instantDemoBadge: 'Demonstração Imediata',

    footerDisclaimer: 'Uso estritamente autorizado para avaliação defensiva de segurança e auditoria.',
    footerRights: 'Mecanismo de Avaliação de Segurança Defensiva e Análise OSINT',
  },

  ar: {
    appName: 'WEBSCANNER',
    tagline: 'محرك تدقيق الثغرات الأمنية والتحليل الاستخباراتي المفتوح المصدر (OSINT)',
    heroTitle: 'فاحص الثغرات الأمنية للمواقع الإلكترونية',
    heroSubtitle: 'افحص ترويسات أمان HTTP، وتشفير TLS/SSL، وسجلات DNS، وسياسات SPF/DMARC، والمنافذ المفتوحة، وقم بتوليد تقارير تنفيذية بصيغة PDF.',
    inputPlaceholder: 'أدخل الرابط أو النطاق المستهدف (مثال: https://target-site.com)',
    aiAnalysisLabel: 'تحليل تنفيذي بالذكاء الاصطناعي',
    scanButton: 'بدء الفحص',
    scanningButton: 'جاري الفحص...',
    sampleAudits: 'فحوصات نموذجية:',
    liveTelemetry: 'بيانات الفحص الحية',
    progressStep1: 'بدء تحليل عنوان النطاق المستهدف...',
    progressStep2: 'التحقق من سجلات DNS وخوادم البريد الإلكتروني...',
    progressStep3: 'فحص شهادة TLS والصلاحية وخوارزميات التشفير...',
    progressStep4: 'تدقيق ترويسات أمان HTTP وسياسات ملفات تعريف الارتباط...',
    progressStep5: 'التعرف على بيئة البرمجيات ونظام إدارة المحتوى وثغرات CVE...',
    progressStep6: 'فحص منافذ الإدارة الحساسة والمسارات غير المحمية...',
    progressStep7: 'صياغة التقرير التنفيذي للتهديدات بواسطة الذكاء الاصطناعي Gemini...',

    navOverview: 'نظرة عامة',
    navFlaws: 'الثغرات',
    navHeaders: 'ترويسات HTTP',
    navSslDns: 'SSL و DNS',
    navTechPorts: 'التقنيات والمنافذ',
    navExecutive: 'التقرير التنفيذي',

    exportPdf: 'تصدير PDF',
    newAudit: 'فحص جديد',
    viewSampleAudit: 'عرض نموذج تجريبي',
    copySnippet: 'نسخ الكود',
    copied: 'تم النسخ',

    targetAudit: 'تدقيق الهدف',
    securityScore: 'نقاط الأمان',
    grade: 'التقييم',
    strictHttps: 'تشفير HTTPS إلزامي',
    httpNotRedirected: 'غير موجه تلقائياً إلى HTTPS',
    criticalRisk: 'حرج',
    highRisk: 'خطر مرتفع',
    mediumRisk: 'متوسط',
    lowRisk: 'خطر منخفض',
    passedChecks: 'فحوصات ناجحة',

    allSeverities: 'الكل',
    filterPlaceholder: 'تصفية الثغرات حسب الكلمات المفتاحية أو CVE...',
    noFlawsFound: 'لم يتم العثور على ثغرات أمنية مطابقة',
    techVulnerabilityAnalysis: 'التحليل الفني للثغرة الأمنية',
    exploitationImpact: 'أثر الاستغلال والمخاطر التشغيلية',
    evidenceFinding: 'الأدلة والمخرجات المسجلة',
    recommendedRemediation: 'إجراءات المعالجة والإصلاح الموصى بها',
    cvssScoreLabel: 'مقياس CVSS',

    headersMatrixTitle: 'مصفوفة ترويسات أمان HTTP',
    headersMatrixDesc: 'تقييم ترويسات الدفاع الموصى بها من OWASP ضد هجمات XSS و Clickjacking واعتراض البيانات.',
    recommendationLabel: 'التوصية',
    foundValue: 'القيمة المكتشفة',

    sslAuditTitle: 'تدقيق التشفير وأمان TLS / SSL',
    sslAuditDesc: 'فحص مصافحة TLS وصلاحية الشهادة الرقمية وخوارزميات التشفير.',
    certValid: 'الشهادة صالحة',
    certInvalid: 'غير صالحة أو غير موثوقة',
    daysRemaining: 'الأيام المتبقية',
    issuedOn: 'تاريخ الإصدار',
    expiresOn: 'تاريخ الانتهاء',
    issuerCa: 'الجهة المانحة للشهادة (CA)',
    subjectCn: 'اسم النطاق الموثق (CN)',
    activeCipher: 'خوارزمية التشفير النشطة',
    dnsEmailTitle: 'حماية DNS ومكافحة انتحال البريد الإلكتروني',
    dnsEmailDesc: 'التحقق من سجلات SPF و DMARC و DNS لمنع تزوير البريد الإلكتروني.',
    spfTitle: 'سجل SPF',
    dmarcTitle: 'سياسة DMARC',
    dnsRecordsTitle: 'سجلات منطقة DNS المكتشفة',
    cookieSecurityTitle: 'سمات أمان ملفات تعريف الارتباط (Cookies)',
    cookieSecurityDesc: 'فحص سمات Secure و HttpOnly و SameSite لحماية جلسات المستخدمين.',

    techFingerprintTitle: 'بصمة التقنيات المستخدمة وتنبيهات CVE',
    techFingerprintDesc: 'اكتشاف خوادم الويب وبيئات العمل وأنظمة إدارة المحتوى.',
    knownCveAdvisories: 'تنبيهات ثغرات CVE المعروفة',
    portReconTitle: 'استكشاف المنافذ وخدمات الشبكة',
    portReconDesc: 'فحص آمن غير تخريبي للمنافذ وقواعد البيانات المعرضة للإنترنت.',
    robotsTxtTitle: 'سياسة الزحف في robots.txt',
    securityTxtTitle: 'ملف security.txt (معيار RFC 9116)',
    disallowedRoutes: 'المسارات المحظورة',

    cisoReportTitle: 'الموجز الأمني التنفيذي لرؤساء أمن المعلومات (CISO)',
    cisoReportDesc: 'تقييم شامل للمخاطر وتحليل استراتيجي لمسارات التهديد.',
    executiveSummaryHeading: 'الملخص التنفيذي',
    attackSurfaceHeading: 'تقييم سطح الهجوم الخارجي',
    threatPathwaysHeading: 'مسارات الاستغلال والتهديد الرئيسية',
    remediationRoadmapHeading: 'خارطة طريق المعالجة حسب الأولوية',
    estimatedEffortLabel: 'الجهد المقدر للإصلاح',
    complianceReadinessHeading: 'مطابقة المعايير والامتثال الأمني',

    deepVulnCardTitle: 'تدقيق شامل للثغرات',
    deepVulnCardDesc: 'كشف الترويسات المفقودة، والتشفير الضعيف، والشهادات المنتهية، والمنافذ المكشوفة.',
    aiThreatCardTitle: 'تحليل المخاطر بالذكاء الاصطناعي',
    aiThreatCardDesc: 'توليد خطة عمل علاجية شاملة ومصنفة بحسب الأولوية.',
    exportPdfCardTitle: 'تقارير احترافية بصيغة PDF',
    exportPdfCardDesc: 'إنشاء تقارير متعددة الصفحات بدقة متناهية مع أكواد الإصلاح الجاهزة.',
    sampleAuditBannerTitle: 'استعراض فحص أمني تجريبي',
    sampleAuditBannerDesc: 'اطلع على كيفية تصنيف الثغرات وتقديم التوصيات وتصدير التقارير.',
    instantDemoBadge: 'تجربة فورية',

    footerDisclaimer: 'هذه الأداة مخصصة حصراً للاستخدام المصرح به في تدقيق الأمان الدفاعي.',
    footerRights: 'محرك الفحص الأمني الدفاعي والتحليل الاستخباراتي',
  },
};
