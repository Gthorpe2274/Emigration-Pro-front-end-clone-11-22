import fs from 'fs';

// Read .env file
const envContent = fs.readFileSync('.env', 'utf8');
const lines = envContent.split('\n');

const vars = {};
lines.forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (key === 'YOUTUBE_API_KEY' || key === 'GEMINI_API_KEY') {
            vars[key] = value;
        }
    }
});

// Read wrangler.json
const wranglerConfig = JSON.parse(fs.readFileSync('wrangler.json', 'utf8'));

// Update vars
wranglerConfig.vars = vars;

// Write back to wrangler.json
fs.writeFileSync('wrangler.json', JSON.stringify(wranglerConfig, null, 2));

console.log('✅ wrangler.json updated with API keys from .env');
console.log('Keys set:', Object.keys(vars));
