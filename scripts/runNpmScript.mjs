import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import path from 'node:path';

/** Run npm through Node, avoiding Windows .cmd execution and shell quoting. */
export function runNpmScript(name, options = {}) {
 const npmCli = process.env.npm_execpath || path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
 if (existsSync(npmCli)) return spawnSync(process.execPath, [npmCli, 'run', name], options);
 if (process.platform !== 'win32') return spawnSync('npm', ['run', name], options);
 return {status: null, error: new Error('Cannot locate npm-cli.js. Run this check through npm run.')};
}
