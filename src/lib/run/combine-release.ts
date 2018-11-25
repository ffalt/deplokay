import {EmitType} from '..';
import {getManifest, shellSpawn} from '../utils';
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
		delete manifest.devDependencies;
		await fse.writeFile(path.resolve(destDir, 'package.json'), JSON.stringify(manifest, null, '\t'));
		await this.emit(EmitType.OPERATION, 'generating', `Generating ${'package-lock.json'}`);
		await shellSpawn('npm', ['install', '--production', '--no-color', '-no-audit'], {cwd: destDir}, (s: string) => {
			this.emit(EmitType.LOG, '', s);
		});
		await this.emit(EmitType.SUCCESS, 'generating', '');
		await fse.remove(path.resolve(destDir, 'node_modules'));
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
					await this.emit(EmitType.LOG, '', subentry);
				}
			}
		}

		if (opts.COMPONENTS && opts.COMPONENTS.length > 0) {
			for (const entry of opts.COMPONENTS) {
				await fse.copy(path.resolve(opts.SOURCE_DIR, entry), path.resolve(opts.RELEASE_DIR, entry));
				copied.push(entry);
				await this.emit(EmitType.LOG, '', entry);
			}
		}

		if (copied.length === 0) {
			return Promise.reject('Release folder is empty.');
		} else {
			if (opts.GENERATE_SLIM_PACKAGE) {
				await this.configureNPMJson(opts.SOURCE_DIR, opts.RELEASE_DIR);
			}
			await this.emit(EmitType.SUCCESS, 'generated', '');
		}

	}
}
