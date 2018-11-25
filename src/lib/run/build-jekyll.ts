import path from 'path';
import fse from 'fs-extra';
import {EmitType} from '..';
import {buildEnv, shellSpawn} from '../utils';
import {Run} from './run-base';

export interface BuildJekyllOptions {
	BUILD_SOURCE_DIR: string;
	BUILD_DEST_DIR: string;
	BUILD_ENV?: { [name: string]: string };
}

export class BuildJekyllRun extends Run<BuildJekyllOptions> {

	private hasBuildErrorMsg(text: string): boolean {
		return this.hasInstallErrorMsg(text);
	}

	private hasInstallErrorMsg(text: string): boolean {
		const reg = /(missing gem executables|Could not locate Gemfile|command not found|GemNotFound|error)/i;
		return !!text.match(reg);
	}

	private async build(opts: BuildJekyllOptions): Promise<void> {
		await this.emit(EmitType.OPERATION, 'building', `Building Jekyll ${opts.BUILD_SOURCE_DIR}`);
		const exec_options: {
			cwd: string;
			env: { [name: string]: any };
		} = {
			cwd: opts.BUILD_SOURCE_DIR,
			env: buildEnv(opts.BUILD_ENV)
		};
		const gemfile = path.resolve(opts.BUILD_SOURCE_DIR, 'Gemfile');
		await this.ensureGemfile(gemfile);
		exec_options.env['BUNDLE_GEMFILE'] = gemfile;
		let result = '';
		try {
			await shellSpawn('bundle', ['exec', 'jekyll', 'build', '-d', opts.BUILD_DEST_DIR], exec_options, (s: string) => {
				result += s + '\n';
				this.emit(EmitType.LOG, '', s);
			});
		} catch (e) {
			if (e) {
				result += e.toString();
			}
		}
		// let result = await this.execute(`bundle exec jekyll build -d ${opts.BUILD_DEST_DIR}`, exec_options);
		if (this.hasBuildErrorMsg(result)) {
			if (result.indexOf('Generating... \n') >= 0) {
				result = result.split('Generating... \n')[1];
				if (result.indexOf('done.') >= 0) {
					result = result.split('done.')[0];
				}
			}
			return Promise.reject(result);
		}
		if (result.indexOf('Generating... \n') >= 0) {
			result = result.split('Generating... \n')[1];
			if (result.indexOf('done.') >= 0) {
				result = result.split('done.')[0];
			}
		}
		await this.emit(EmitType.SUCCESS, 'build', '');
	}

	private async ensureGemfile(gemfile: string): Promise<void> {
		const exists = await fse.pathExists(gemfile);
		if (!exists) {
			const gem = `source 'https://rubygems.org'
gem 'jekyll'
gem 'github-pages'`;
			await fse.writeFile(gemfile, gem);
		}
	}

	private async install(opts: BuildJekyllOptions): Promise<void> {
		const gemfile = path.resolve(opts.BUILD_SOURCE_DIR, 'Gemfile');
		await this.ensureGemfile(gemfile);
		const jekyll_dir = path.resolve(opts.BUILD_SOURCE_DIR, '.gem');

		await this.emit(EmitType.OPERATION, 'installing', `Installing Jekyll into ${jekyll_dir}`);
		const exec_options: {
			cwd: string;
			env: { [name: string]: any };
		} = {
			cwd: opts.BUILD_SOURCE_DIR,
			env: buildEnv(opts.BUILD_ENV)
		};
		let result = '';
		await shellSpawn('babababundle', ['install', '--gemfile=' + gemfile, '--path', jekyll_dir], exec_options, (s: string) => {
			result += s + '\n';
			this.emit(EmitType.LOG, '', s);
		});
		if (this.hasInstallErrorMsg(result)) {
			return Promise.reject(result);
		}
		await this.emit(EmitType.SUCCESS, 'installed', '');
	}

	async run(opts: BuildJekyllOptions): Promise<void> {
		const jekyll_dir = path.resolve(opts.BUILD_SOURCE_DIR, '.gem');
		const exists = await fse.pathExists(jekyll_dir);
		if (!exists) {
			await this.install(opts);
		}
		try {
			return await this.build(opts);
		} catch (e) {
			const err = e.toString();
			if (this.hasInstallErrorMsg(err)) {
				await this.install(opts);
				return await this.build(opts);
			} else {
				return Promise.reject(err);
			}
		}
	}
}
