import {EmitType} from '..';
import {buildEnv, getManifest, shellExec, ShellExecOptions} from '../utils';
import {Run} from './run-base';
import fse from 'fs-extra';
import path from 'path';

export interface BuildNPMOptions {
	BUILD_SOURCE_DIR: string;
	BUILD_CMD: string;
	BUILD_ENV?: { [name: string]: string };
}

export class BuildNPMRun extends Run<BuildNPMOptions> {

	private buildEnv(opts: BuildNPMOptions): { [name: string]: any } {
		const env = Object.assign({'NODE_DISABLE_COLORS': 'true'}, opts.BUILD_ENV || {});
		return buildEnv(env);
	}

	private async build(opts: BuildNPMOptions): Promise<void> {
		await this.emit(EmitType.OPERATION, 'building', `Building with NPM ${opts.BUILD_CMD} in ${opts.BUILD_SOURCE_DIR}`);
		const exec_options: {
			cwd: string;
			env: { [name: string]: any };
		} = {
			cwd: opts.BUILD_SOURCE_DIR,
			env: this.buildEnv(opts)
		};
		const result = await this.execute(`npm run --no-color ${opts.BUILD_CMD}`, exec_options);
		await this.emit(EmitType.SUCCESS, 'build', result);
	}

	private async execute(cmd: string, exec_options: ShellExecOptions): Promise<string> {
		const {stdout} = await shellExec(cmd, exec_options);
		return (stdout || '');
	}

	private async install(opts: BuildNPMOptions): Promise<void> {
		await this.emit(EmitType.OPERATION, 'installing', `Installing npm dependencies`);
		const exec_options: {
			cwd: string;
			env: { [name: string]: any };
		} = {
			cwd: opts.BUILD_SOURCE_DIR,
			env: this.buildEnv(opts)
		};
		const result = await this.execute(`npm install -s --no-color -no-audit`, exec_options);
		await this.emit(EmitType.SUCCESS, 'installed', result);
	}


	async run(opts: BuildNPMOptions): Promise<void> {
		await this.install(opts);
		await this.build(opts);

	}
}
