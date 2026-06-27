import { cpSync, existsSync, rmSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const serverDir=path.resolve(__dirname,'..');
const clientDist=path.resolve(serverDir,'..','client','dist');
const publicDir=path.join(serverDir,'public');

if(!existsSync(clientDist)){
    throw new Error(`Client build not found at ${clientDist}`);
}

rmSync(publicDir,{ recursive:true, force:true });
cpSync(clientDist,publicDir,{ recursive:true });
console.log(`Copied client build to ${publicDir}`);
