import fs from 'node:fs';
import path from 'node:path';

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').trim();
    if (key) {
      process.env[key.trim()] = value;
    }
  });
}

export const config = {
  inputFile: process.env.INPUT_FILE || 'data/users.csv',
  outputFile: process.env.OUTPUT_FILE || 'data/result.csv',
  minAge: parseInt(process.env.MIN_AGE, 10) || 0,
  cityFilter: process.env.CITY_FILTER || '',
};