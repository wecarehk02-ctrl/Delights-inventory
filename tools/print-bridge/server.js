#!/usr/bin/env node
/*
 * Local print bridge for Delights Inventory.
 *
 * GitHub Pages cannot print silently from the browser. Run this helper on the
 * Windows PC connected to the Epson LQ-615KII, then set the app's printer mode
 * to "Local bridge 自動打印".
 */
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const PORT = Number(process.env.PORT || 8787);
const DEFAULT_PRINTER = process.argv.slice(2).join(' ') || process.env.PRINTER_NAME || 'EPSON LQ-615KII';
const PRINT_SCRIPT = path.join(__dirname, 'print.ps1');

function send(res, status, body) {
  const json = JSON.stringify(body || {});
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(json);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 1024 * 1024) {
        reject(new Error('Request too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function printFile(filePath, printerName, copies) {
  return new Promise((resolve, reject) => {
    const child = spawn('powershell.exe', [
      '-NoProfile',
      '-ExecutionPolicy', 'Bypass',
      '-File', PRINT_SCRIPT,
      '-FilePath', filePath,
      '-PrinterName', printerName,
      '-Copies', String(copies)
    ], { windowsHide: true });

    let out = '';
    let err = '';
    child.stdout.on('data', d => { out += d.toString(); });
    child.stderr.on('data', d => { err += d.toString(); });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) resolve(out.trim());
      else reject(new Error((err || out || `PowerShell exited ${code}`).trim()));
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 200, { ok: true });
  if (req.method !== 'POST' || req.url !== '/print') {
    return send(res, 404, { ok: false, error: 'Use POST /print' });
  }

  let tmp = '';
  try {
    const payload = JSON.parse(await readBody(req));
    const text = String(payload.text || '');
    if (!text.trim()) return send(res, 400, { ok: false, error: 'Missing text' });

    const printerName = String(payload.printerName || DEFAULT_PRINTER);
    const copies = Math.max(1, Math.min(10, Number(payload.copies || 1)));
    const safeNo = String(payload.orderNo || 'delivery-note').replace(/[^a-z0-9_-]+/gi, '-');
    tmp = path.join(os.tmpdir(), `delights-${safeNo}-${Date.now()}.txt`);
    fs.writeFileSync(tmp, text, 'utf8');

    await printFile(tmp, printerName, copies);
    send(res, 200, { ok: true, printerName, copies });
  } catch (err) {
    send(res, 500, { ok: false, error: err.message });
  } finally {
    if (tmp) fs.promises.unlink(tmp).catch(() => {});
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Delights print bridge listening at http://127.0.0.1:${PORT}/print`);
  console.log(`Default printer: ${DEFAULT_PRINTER}`);
});
