import {EmitType} from '..';
import {buildEnv, shellSpawn} from '../utils';
import {Run} from './run-base';

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

	private async install(opts: BuildNPMOptions): Promise<void> {
		await this.emit(EmitType.OPERATION, 'installing', `Installing npm dependencies`);
		const spawn_options: {
			cwd: string;
			env: { [name: string]: any };
		} = {
			cwd: opts.BUILD_SOURCE_DIR,
			env: this.buildEnv(opts)
		};
		await shellSpawn('npm', ['install', '--no-color', '-no-audit'], spawn_options, (s: string) => {
			this.emit(EmitType.LOG, '', s);
		});
		await this.emit(EmitType.SUCCESS, 'installed', '');
	}

	private async build(opts: BuildNPMOptions): Promise<void> {
		await this.emit(EmitType.OPERATION, 'building', `Building with NPM ${opts.BUILD_CMD} in ${opts.BUILD_SOURCE_DIR}`);
		const spawn_options: {
			cwd: string;
			env: { [name: string]: any };
		} = {
			cwd: opts.BUILD_SOURCE_DIR,
			env: this.buildEnv(opts)
		};
		await shellSpawn('npm', ['run', '--no-color', opts.BUILD_CMD], spawn_options, (s: string) => {
			this.emit(EmitType.LOG, '', s);
		});
		await this.emit(EmitType.SUCCESS, 'build', '');
	}


	async run(opts: BuildNPMOptions): Promise<void> {
		await this.install(opts);
		await this.build(opts);

	}
}
