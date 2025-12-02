#!/usr/bin/env node

import fs from 'fs';
import { spawn } from 'child_process';

// Read .env file
const envContent = fs.readFileSync('.env', 'utf8');
const lines = envContent.split('\n');

const secrets = {};
lines.forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (key === 'YOUTUBE_API_KEY' || key === 'GEMINI_API_KEY') {
            secrets[key] = value;
        }
    }
});

async function setSecret(key, value) {
    return new Promise((resolve, reject) => {
        const proc = spawn('npx', ['wrangler', 'secret', 'put', key], {
            stdio: ['pipe', 'inherit', 'inherit'],
            shell: true
        });

        proc.stdin.write(value);
        proc.stdin.end();

        proc.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Failed to set ${key}`));
            }
        });
    });
}

async function main() {
    for (const [key, value] of Object.entries(secrets)) {
        console.log(`Setting ${key}...`);
        try {
            await setSecret(key, value);
            console.log(`✅ ${key} set successfully`);
        } catch (error) {
            console.error(`❌ Failed to set ${key}:`, error.message);
        }
    }
}

main().catch(console.error);
