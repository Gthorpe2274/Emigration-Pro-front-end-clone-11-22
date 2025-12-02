
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');

    const secrets = {};
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim();
            if (key === 'YOUTUBE_API_KEY' || key === 'GEMINI_API_KEY') {
                secrets[key] = value;
            }
        }
    });

    fs.writeFileSync('secrets.json', JSON.stringify(secrets, null, 2));
    console.log('secrets.json created');
} catch (error) {
    console.error('Error:', error);
    process.exit(1);
}
