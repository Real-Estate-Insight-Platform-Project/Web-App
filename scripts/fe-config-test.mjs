#!/usr/bin/env node
// Frontend Configuration Test (single-file)
// Run: node scripts/fe-config-test.mjs --base http://localhost:3000
// Or:  node scripts/fe-config-test.mjs  (will build/start the app on port 3000)

import { chromium, firefox, webkit, devices } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

// Load environment variables from .env file
function loadEnvFile() {
  try {
    const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const envLines = envContent.split('\n');
      
      for (const line of envLines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          if (key && valueParts.length > 0) {
            let value = valueParts.join('=').trim();
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            process.env[key.trim()] = value;
          }
        }
      }
      console.log('Loaded .env file successfully');
    }
  } catch (error) {
    console.log('Could not load .env file:', error.message);
  }
}

// Load .env file at startup
loadEnvFile();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------
// Configurable inputs
// -----------------------------
const ARGS = parseArgs(process.argv.slice(2));
const BASE_URL = ARGS.base || 'http://localhost:3000';
const START_APP = !ARGS.base; // start Next.js ourselves only if base not provided
const PORT = ARGS.port ? Number(ARGS.port) : 3000;

// Authentication credentials from environment variables
const TEST_EMAIL = process.env.TEST_EMAIL || ARGS.email;
const TEST_PASSWORD = process.env.TEST_PASSWORD || ARGS.password;
const ENABLE_AUTH_TESTING = TEST_EMAIL && TEST_PASSWORD;

// Set the routes you want to exercise (customize for your app)
const ROUTES = [
  '/',
  '/auth/login',
  '/auth/sign-up',
  '/auth/sign-up-success',
  '/dashboard',
  '/dashboard/agent-finder',
  '/dashboard/analysis',
  '/dashboard/calculator',
  '/dashboard/chat-assistant',
  '/dashboard/favorites',
  '/dashboard/market-insights',
  '/dashboard/portfolio',
  '/dashboard/profile',
  '/dashboard/risk-map',
  '/dashboard/search',
  '/dashboard/settings'
].map(r => r.replace(/\/+$/, '') || '/');

// Browsers & devices
const BROWSERS = [
  { name: 'chromium', launcher: chromium },
  { name: 'firefox',  launcher: firefox  },
  { name: 'webkit',   launcher: webkit   },
];

const VIEWPORTS = [
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1920x1080', width: 1920, height: 1080 },
];

const MOBILE_PROFILES = [
  { name: 'iPhone 12', descriptor: devices['iPhone 12'] }, // Playwright device descriptor
];

// Network profiles (bandwidth in kbps; latency in ms)
const NETWORK_PROFILES = [
  { name: 'Good3G', latency: 40, downloadKbps: 1600, uploadKbps: 750 },
  { name: 'Regular4G', latency: 20, downloadKbps: 9000, uploadKbps: 9000 },
];

// Output
const REPORT_PATH = ARGS.report || 'fe_config_test_report.json';
const LOG_PATH = 'fe_config_test.log';

// -----------------------------
// Helpers
// -----------------------------
log(`FE Config Test starting. Base URL: ${BASE_URL} | Port: ${PORT}`);
if (ENABLE_AUTH_TESTING) {
  log(`Authentication testing enabled for user: ${TEST_EMAIL}`);
} else {
  log(`Authentication testing disabled - dashboard pages will show redirects`);
}

let nextProc = null;
if (START_APP) {
  // Prefer production run for stability and Lighthouse signals
  log('Building Next.js app...');
  runOrThrow(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build']);
  log('Starting Next.js server...');
  nextProc = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'start'], {
    env: { ...process.env, PORT: String(PORT), NEXT_TELEMETRY_DISABLED: '1' },
    stdio: 'pipe',
  });
  await waitForHttpOk(`http://localhost:${PORT}`, 90_000);
  log('Next.js server is up.');
}

// Build test matrix
const matrix = [];
for (const b of BROWSERS) {
  for (const v of VIEWPORTS) {
    for (const n of NETWORK_PROFILES) {
      matrix.push({ browser: b.name, viewport: v.name, device: 'none', net: n.name });
    }
  }
  // Mobile emulation only for Chromium (other browsers don't support device emulation well)
  if (b.name === 'chromium') {
    for (const m of MOBILE_PROFILES) {
      for (const n of NETWORK_PROFILES) {
        matrix.push({ browser: b.name, viewport: m.name, device: m.name, net: n.name, mobile: true });
      }
    }
  }
}

const results = [];
for (const cfg of matrix) {
  log(`Testing: ${cfg.browser} | ${cfg.viewport} | ${cfg.net}`);
  const r = await runScenario(cfg);
  results.push(r);
}

// Write aggregate report
const summary = makeSummary(results);
fs.writeFileSync(REPORT_PATH, JSON.stringify(summary, null, 2), 'utf-8');
log(`Saved report: ${REPORT_PATH}`);

if (nextProc) {
  log('Stopping Next.js server...');
  nextProc.kill('SIGTERM');
  await new Promise(res => setTimeout(res, 1500));
}

process.exit(summary.summary.failed > 0 ? 1 : 0);

// -----------------------------
// Authentication helper
// -----------------------------
async function performLogin(page, email, password) {
  try {
    log(`Attempting login for ${email}...`);
    
    // Navigate to login page
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle', timeout: 30_000 });
    
    // Wait for the specific form elements from your login page
    log('Waiting for login form elements...');
    await page.waitForSelector('#email', { timeout: 15_000 });
    await page.waitForSelector('#password', { timeout: 15_000 });
    
    // Fill the email field
    log('Filling email field...');
    await page.fill('#email', email);
    
    // Fill the password field
    log('Filling password field...');
    await page.fill('#password', password);
    
    // Wait a moment for form to be ready
    await page.waitForTimeout(1000);
    
    // Click the submit button
    log('Clicking submit button...');
    await page.click('button[type="submit"]');
    
    // Wait for navigation or error
    log('Waiting for login response...');
    try {
      // Wait for either successful navigation to dashboard or error message
      await Promise.race([
        page.waitForURL('**/dashboard**', { timeout: 10_000 }),
        page.waitForSelector('.text-destructive', { timeout: 10_000 }) // Error message selector
      ]);
    } catch (navigationError) {
      log(`Navigation timeout: ${navigationError.message}`);
    }
    
    // Wait a bit more to ensure the page has settled
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    log(`Current URL after login attempt: ${currentUrl}`);
    
    // Check for error messages
    const errorElement = await page.$('.text-destructive');
    if (errorElement) {
      const errorText = await errorElement.textContent();
      log(`Login error displayed: ${errorText}`);
      return false;
    }
    
    // Check if we're successfully redirected to dashboard
    const isLoggedIn = currentUrl.includes('/dashboard');
    
    if (isLoggedIn) {
      log(`Login successful - redirected to: ${currentUrl}`);
      return true;
    } else {
      log(`Login may have failed - still on: ${currentUrl}`);
      return false;
    }
    
  } catch (error) {
    log(`Login failed with error: ${error.message}`);
    return false;
  }
}

// -----------------------------
// Scenario runner
// -----------------------------
async function runScenario(cfg) {
  const launcher = BROWSERS.find(b => b.name === cfg.browser).launcher;

  // BrowserLaunch & Context
  const browser = await launcher.launch();
  let context;
  if (cfg.mobile && cfg.browser === 'chromium') {
    // Mobile emulation only works reliably in Chromium
    const deviceDescriptor = MOBILE_PROFILES.find(m => m.name === cfg.device)?.descriptor;
    context = await browser.newContext(deviceDescriptor || {});
  } else {
    const viewport = VIEWPORTS.find(v => v.name === cfg.viewport);
    context = await browser.newContext({ viewport });
  }

  const page = await context.newPage();

  // Apply network profile
  await applyNetworkProfile(context, page, cfg);

  const scenario = {
    config: cfg,
    timestamp: new Date().toISOString(),
    runs: [],
    axe: {},
    lighthouse: {},
    status: 'started',
    errors: [],
    authenticated: false,
  };

  try {
    // Perform authentication if credentials are provided
    if (ENABLE_AUTH_TESTING) {
      scenario.authenticated = await performLogin(page, TEST_EMAIL, TEST_PASSWORD);
      if (!scenario.authenticated) {
        log(`Authentication failed for ${cfg.browser} - testing will show redirects`);
      }
    }
    for (const route of ROUTES) {
      const url = BASE_URL.replace(/\/+$/, '') + (route.startsWith('/') ? route : `/${route}`);
      const navStart = Date.now();
      
      log(`  → Visiting: ${route} (${url})`);
      
      try {
        const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
        const status = resp?.status() || 0;

        // Basic assertions - handle auth redirects as success
        const bodyText = await page.evaluate(() => document.body?.innerText?.trim() || '');
        const currentUrl = page.url();
        
        // Consider it successful if:
        // 1. HTTP status is 2xx-3xx, AND
        // 2. Page has content, OR
        // 3. It's an auth redirect (redirect to login page is expected behavior)
        const isAuthRedirect = currentUrl.includes('/auth/login') && !url.includes('/auth/login');
        const ok = (status >= 200 && status < 400) && (bodyText.length > 0 || isAuthRedirect);

        // Collect simple perf timing
        const timing = await page.evaluate(() => {
          const nav = performance.getEntriesByType('navigation')[0];
          if (!nav) return {};
          return {
            domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
            loadEvent: nav.loadEventEnd - nav.startTime,
            ttfb: nav.responseStart - nav.requestStart,
          };
        });

        scenario.runs.push({
          route,
          url,
          httpStatus: status,
          ok,
          responseTimeMs: Date.now() - navStart,
          timing,
          actualUrl: currentUrl,
          isAuthRedirect,
        });

        if (isAuthRedirect) {
          log(`  ✓ ${route} → redirected to auth (expected behavior)`);
        } else if (ok) {
          log(`  ✓ ${route} → loaded successfully (${Math.round(Date.now() - navStart)}ms)`);
        } else {
          log(`  ✗ ${route} → failed (status: ${status})`);
        }
      } catch (routeError) {
        // Handle route-specific errors (like auth redirects)
        log(`  ✗ ${route} → error: ${routeError.message}`);
        scenario.runs.push({
          route,
          url,
          httpStatus: 0,
          ok: false,
          responseTimeMs: Date.now() - navStart,
          timing: {},
          error: routeError.message,
        });
      }
    }

    // Accessibility (axe) - run on the home page
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 45_000 });
      const axeResults = await new AxeBuilder({ page }).analyze();
      scenario.axe = normalizeAxe(axeResults);
    } catch (axeError) {
      log(`Axe accessibility test failed: ${axeError.message}`);
      scenario.axe = { error: axeError.message };
    }

    // Lighthouse (Chromium only, and only when not Offline)
    if (cfg.browser === 'chromium' && cfg.net !== 'Offline') {
      const lhOut = await runLighthouse(BASE_URL, cfg);
      scenario.lighthouse = lhOut || {};
    }

    // Determine status
    const anyFail = scenario.runs.some(r => !r.ok);
    scenario.status = anyFail ? 'partial' : 'passed';
    
    // Log summary for this configuration
    const passedRoutes = scenario.runs.filter(r => r.ok).length;
    const totalRoutes = scenario.runs.length;
    log(`  Configuration complete: ${passedRoutes}/${totalRoutes} routes passed`);
  } catch (e) {
    scenario.status = 'failed';
    scenario.errors.push(String(e && e.message ? e.message : e));
  } finally {
    await context.close();
    await browser.close();
  }
  return scenario;
}

// -----------------------------
// Network emulation helpers
// -----------------------------
async function applyNetworkProfile(context, page, cfg) {
  if (cfg.net === 'Offline') {
    await context.setOffline(true);
    return;
  }
  // Chromium: use CDP Network.emulateNetworkConditions
  if (cfg.browser === 'chromium') {
    try {
      const client = await context.newCDPSession(page);
      await client.send('Network.enable');
      const profile = NETWORK_PROFILES.find(p => p.name === cfg.net);
      if (profile) {
        await client.send('Network.emulateNetworkConditions', {
          offline: false,
          latency: profile.latency,
          downloadThroughput: profile.downloadKbps * 1024 / 8,
          uploadThroughput: profile.uploadKbps * 1024 / 8,
        });
      }
    } catch (cdpError) {
      log(`CDP network emulation failed: ${cdpError.message}`);
    }
  } else {
    // Firefox/WebKit: approximate by adding latency via routing
    const profile = NETWORK_PROFILES.find(p => p.name === cfg.net);
    const delay = profile ? profile.latency : 0;
    await context.route('**/*', async (route) => {
      await new Promise(res => setTimeout(res, delay));
      return route.continue();
    });
  }
}

// -----------------------------
// Lighthouse runner
// -----------------------------
async function runLighthouse(baseUrl, cfg) {
  // Run only against the root route to keep it fast
  const url = baseUrl.replace(/\/+$/, '') + '/';
  const outPath = path.join(os.tmpdir(), `lh-${Date.now()}.json`);

  const flags = [
    url,
    '--quiet',
    '--chrome-flags="--headless=new --disable-gpu"',
    '--output=json',
    `--output-path=${outPath}`,
  ];
  
  try {
    const res = spawnSync(process.platform === 'win32' ? 'lighthouse.cmd' : 'lighthouse', flags, {
      encoding: 'utf-8',
      timeout: 120_000,
    });
    
    if (res.error) return { error: String(res.error) };
    
    const text = fs.readFileSync(outPath, 'utf-8');
    const json = JSON.parse(text);
    return {
      performance: json.categories?.performance?.score ?? null,
      accessibility: json.categories?.accessibility?.score ?? null,
      bestPractices: json.categories?.['best-practices']?.score ?? null,
      seo: json.categories?.seo?.score ?? null,
      pwa: json.categories?.pwa?.score ?? null,
      // Keep it small; the full file is large
    };
  } catch (e) {
    return { error: String(e) };
  }
}

// -----------------------------
// Utilities
// -----------------------------
function parseArgs(args) {
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const k = args[i];
    const v = args[i + 1];
    if (k === '--base') { out.base = v; i++; }
    if (k === '--port') { out.port = v; i++; }
    if (k === '--report') { out.report = v; i++; }
    if (k === '--email') { out.email = v; i++; }
    if (k === '--password') { out.password = v; i++; }
  }
  return out;
}

function runOrThrow(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' } });
  if (r.error || r.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(' ')}`);
  }
}

async function waitForHttpOk(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) return;
    } catch (_) {}
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error(`Timeout waiting for ${url}`);
}

function normalizeAxe(axeResult) {
  // Handle axe results
  const violations = axeResult?.violations || [];
  const counts = { minor: 0, moderate: 0, serious: 0, critical: 0 };
  for (const v of violations) {
    const impact = v.impact || 'minor';
    if (counts[impact] !== undefined) counts[impact]++;
  }
  return {
    violationCount: violations.length || 0,
    counts,
    passes: axeResult?.passes?.length || 0,
    incomplete: axeResult?.incomplete?.length || 0,
  };
}

function makeSummary(configRuns) {
  const passed = configRuns.filter(r => r.status === 'passed').length;
  const partial = configRuns.filter(r => r.status === 'partial').length;
  const failed  = configRuns.filter(r => r.status === 'failed').length;
  
  // Route analysis across all configurations
  const routeStats = {};
  const authStats = { total: 0, authenticated: 0, failed: 0 };
  
  configRuns.forEach(config => {
    authStats.total++;
    if (config.authenticated) {
      authStats.authenticated++;
    } else if (ENABLE_AUTH_TESTING) {
      authStats.failed++;
    }
    
    config.runs.forEach(run => {
      if (!routeStats[run.route]) {
        routeStats[run.route] = { total: 0, passed: 0, failed: 0, authRedirects: 0, authenticatedAccess: 0 };
      }
      routeStats[run.route].total++;
      if (run.ok) {
        routeStats[run.route].passed++;
        if (config.authenticated && !run.isAuthRedirect) {
          routeStats[run.route].authenticatedAccess++;
        }
      } else {
        routeStats[run.route].failed++;
      }
      if (run.isAuthRedirect) {
        routeStats[run.route].authRedirects++;
      }
    });
  });

  return {
    report_metadata: {
      generated_at: new Date().toISOString(),
      tool_version: 'fe-config-test-1.0.0',
      total_configurations: configRuns.length,
      total_routes_tested: Object.keys(routeStats).length,
      authentication_enabled: ENABLE_AUTH_TESTING,
      test_user: ENABLE_AUTH_TESTING ? TEST_EMAIL : null,
    },
    summary: {
      passed, partial, failed,
      success_rate: configRuns.length ? (passed / configRuns.length) * 100 : 0,
    },
    authentication_analysis: ENABLE_AUTH_TESTING ? authStats : null,
    route_analysis: routeStats,
    configurations: configRuns,
  };
}

function log(msg) {
  const line = `${new Date().toISOString()} ${msg}\n`;
  fs.appendFileSync(LOG_PATH, line, 'utf-8');
  process.stdout.write(line);
}