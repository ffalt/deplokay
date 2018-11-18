import {EmitType} from '..';
import {getManifest, shellExec} from '../utils';
import {Run} from './run-base';
import fse from 'fs-extra';
import path from 'path';

export interface CombineReleaseOptions {
	SOURCE_DIR: string;
	RELEASE_DIR: string;
	COMPONENTS: Array<string>;
	FOLDERS: Array<string>;
	GENERATE_SLIM_PACKAGE: boolean;
	BUILD_ENV?: { [name: string]: string };
}

export class CombineReleaseRun extends Run<CombineReleaseOptions> {

	private async configureNPMJson(soureDir: string, destDir: string): Promise<void> {
		const manifest = await getManifest(soureDir, true);
		await this.emit(EmitType.OPERATION, 'writing', `Writing ${'package.json'}`);
		const pack: { [key: string]: any } = {};
		Object.keys(manifest).forEach(key => {
			if (['name', 'version', 'author', 'license', 'description', 'bin', 'repository', 'dependencies', 'engines'].indexOf(key) >= 0) {
				pack[key] = manifest[key];
			}
		});
		pack.scripts = {};
		Object.keys(manifest.scripts).forEach(key => {
			if (['start'].indexOf(key) >= 0 || key.indexOf('cmd:') === 0) {
				pack.scripts[key] = manifest.scripts[key];
			}
		});
		await fse.writeFile(path.resolve(destDir, 'package.json'), JSON.stringify(pack, null, '\t'));
		await this.emit(EmitType.OPERATION, 'generating', `Generating ${'package-lock.json'}`);
		const result = await shellExec(`npm install --production -s --no-color -no-audit`, {cwd: destDir});
		await this.emit(EmitType.SUCCESS, 'generating', result.stdout || '');
		fse.remove(path.resolve(destDir, 'node_modules'));
	}

	async run(opts: CombineReleaseOptions): Promise<void> {

		await this.emit(EmitType.OPERATION, 'generating', `Generating release folder ${opts.RELEASE_DIR}`);
		const copied = [];
		if (opts.FOLDERS && opts.FOLDERS.length > 0) {
			for (const entry of opts.FOLDERS) {
				const list = await fse.readdir(path.resolve(opts.SOURCE_DIR, entry));
				for (const subentry of list) {
					await fse.copy(path.resolve(opts.SOURCE_DIR, entry, subentry), path.resolve(opts.RELEASE_DIR, subentry));
					copied.push(subentry);
				}
			}
		}

		if (opts.COMPONENTS && opts.COMPONENTS.length > 0) {
			for (const entry of opts.COMPONENTS) {
				await this.emit(EmitType.OPERATION, 'copying', `Copying component ${entry}`);
				await fse.copy(path.resolve(opts.SOURCE_DIR, entry), path.resolve(opts.RELEASE_DIR, entry));
				copied.push(entry);
			}
		}

		if (copied.length === 0) {
			return Promise.reject('Release folder is empty.');
		} else {
			await this.emit(EmitType.SUCCESS, 'generated', copied.join('\n'));
		}

		if (opts.GENERATE_SLIM_PACKAGE) {
			await this.configureNPMJson(opts.SOURCE_DIR, opts.RELEASE_DIR);
		}
	}
}
