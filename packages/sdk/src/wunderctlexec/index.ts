import execa from 'execa';
import fs from 'fs';
import { wunderctlBinaryPath } from '@wundergraph/wunderctl';
import path from 'path';

export interface WunderCtlExecArgs {
	cmd: string[];
	env?: Record<string, string>;
	timeout?: number;
	stdio?: 'pipe' | 'ignore' | 'inherit' | readonly execa.StdioOption[];
}

export type Subprocess = execa.ExecaChildProcess;

export const wunderctl = (args: WunderCtlExecArgs): Subprocess => {
	const file = wunderCtlFile();
	const cmdArgs = wunderCtlArgs(args.cmd);

	return execa(file, cmdArgs, {
		encoding: 'utf-8',
		timeout: args.timeout,
		cwd: process.env.WG_DIR_ABS || process.cwd(),
		env: args.env ?? {},
		extendEnv: true,
		stdio: args.stdio,
	});
};

export const stitcher = (args: WunderCtlExecArgs): Subprocess => {
	const file = stitcherCtlFile();
	const cmdArgs = args.cmd;

	return execa(file, cmdArgs, {
		encoding: 'utf-8',
		timeout: args.timeout,
		cwd: process.env.WG_DIR_ABS || process.cwd(),
		env: args.env ?? {},
		extendEnv: true,
		stdio: args.stdio,
	});
};

const wunderCtlArgs = (args: string[]): string[] => {
	if (process.env.WG_DIR_ABS) {
		args.push('--wundergraph-dir', process.env.WG_DIR_ABS);
	}

	if (process.env.WG_CLI_LOG_LEVEL) {
		args.push('--cli-log-level', process.env.WG_CLI_LOG_LEVEL);
	}

	if (process.env.WG_CLI_LOG_PRETTY) {
		args.push(`--pretty-logging=${process.env.WG_CLI_LOG_PRETTY}`);
	}

	return args;
};

const wunderCtlFile = (): string => {
	const file = wunderctlBinaryPath();
	if (!fs.existsSync(file)) {
		throw new Error('wunderctl binary not found');
	}

	return file;
};

const stitcherCtlFile = (): string => {
	let file = '';
	const binaryDir = path.join(__dirname, '..', 'download');
	if (process.env.STITCHER_BINARY_PATH) {
		file = process.env.STITCHER_BINARY_PATH;
	} else {
		throw new Error('STITCHER_BINARY_PATH environment variable not found.');
	}
	if (!fs.existsSync(file)) {
		throw new Error('stitcher binary not found');
	}

	return file;
};
