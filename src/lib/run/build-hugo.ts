import path from 'path';
import fse from 'fs-extra';
import {buildEnv, shellSpawn} from '../utils';
import {Run} from './run-base';
import {EmitType} from '../index';
import {DEFAULT_HUGO_VERSION} from '../../consts';
import {promisify} from 'util';
import got from 'got';
import unzipper from 'unzipper';
import stream from 'stream';
import fs from 'fs';
// @ts-ignore
import jaguar from 'jaguar';

const pipeline = promisify(stream.pipeline);

export interface BuildHugoOptions {
	BUILD_SOURCE_DIR: string;
	BUILD_DEST_DIR: string;
	BUILD_ENV?: { [name: string]: string };
	BUILD_VERSION: string;
	BUILD_EXTENDED: boolean;
}

export class BuildHugoRun extends Run<BuildHugoOptions> {

	private async build(opts: BuildHugoOptions): Promise<void> {
		await this.emit(EmitType.OPERATION, 'building', `Building Hugo ${opts.BUILD_SOURCE_DIR}`);
		const exec_options: {
			cwd: string;
			env: { [name: string]: any };
		} = {
			cwd: opts.BUILD_SOURCE_DIR,
			env: buildEnv(opts.BUILD_ENV)
		};
		const hugo = path.resolve(opts.BUILD_SOURCE_DIR, './.hugo/hugo') + (process.platform === 'win32' ? '.exe' : '');
		await shellSpawn(hugo, ['-d', opts.BUILD_DEST_DIR], exec_options, (s: string) => {
			this.emit(EmitType.LOG, '', s);
		});
		await this.emit(EmitType.SUCCESS, 'build', '');
	}

	private async downloadFile(url: string, destination: string): Promise<void> {
		await pipeline(
			got.stream(url),
			fs.createWriteStream(destination)
		);
	}

	private async unpack(archive: string, destination: string): Promise<void> {
		let ext = path.extname(archive);
		if (ext === '.zip') {
			const stream = fs.createReadStream(archive);
			await stream.pipe(unzipper.Extract({path: destination, verbose: true})).promise();
		} else {
			return new Promise<void>((resolve, reject) => {
				const extract = jaguar.extract(archive, destination);
				extract.on('error', (e: Error) => {
					reject(e);
				});
				extract.on('end', () => {
					resolve();
				});
			});
		}
	}

	private async download(url: string, filename: string, opts: BuildHugoOptions): Promise<void> {
		const hugo_dir = path.resolve(opts.BUILD_SOURCE_DIR, '.hugo');
		await fse.ensureDir(hugo_dir);
		await this.emit(EmitType.OPERATION, 'installing', `Installing Hugo ${opts.BUILD_EXTENDED ? 'extended ' : ''}into ${hugo_dir}`);
		const archive = path.join(hugo_dir, filename);
		await this.downloadFile(url, archive);
		await this.unpack(archive, hugo_dir);
		await this.emit(EmitType.SUCCESS, 'installed', '');
	}

	private async installSimple(opts: BuildHugoOptions): Promise<void> {
		const version = opts.BUILD_VERSION || DEFAULT_HUGO_VERSION;
		const osData: { [name: string]: string } = {
			'win32': 'Windows',
			'linux': 'Linux',
			'freebsd': 'FreeBSD',
			'darwin': 'macOS'
		};
		const osArch: { [name: string]: string } = {
			'x64': '64bit',
			'x86': '32bit',
			'arm': 'ARM',
			'arm64': 'ARM64'
		};
		if (!osData[process.platform] || !osArch[process.arch]) {
			return Promise.reject('Your system is not supported :.(');
		}
		const githubReleaseUrl = `https://github.com/gohugoio/hugo/releases/download/v${version}/`;
		const ext = process.platform === 'win32' ? 'zip' : 'tar.gz';
		const filename = `hugo_${version}_${osData[process.platform]}-${osArch[process.arch]}.${ext}`
		const url = `${githubReleaseUrl}${filename}`;
		await this.download(url, filename, opts);
	}

	private async installExtended(opts: BuildHugoOptions): Promise<void> {
		const version = opts.BUILD_VERSION;
		const osData: { [name: string]: string } = {
			'win32': 'Windows',
			'linux': 'Linux',
			'darwin': 'macOS'
		};
		if (!osData[process.platform] || process.arch !== 'x64') {
			return Promise.reject('Your system is not supported :.(');
		}
		const githubReleaseUrl = `https://github.com/gohugoio/hugo/releases/download/v${version}/`;
		const ext = process.platform === 'win32' ? 'zip' : 'tar.gz';
		const filename = `hugo_extended_${version}_${osData[process.platform]}-64bit.${ext}`;
		const url = `${githubReleaseUrl}${filename}`;
		await this.download(url, filename, opts);
	}

	private async install(opts: BuildHugoOptions): Promise<void> {
		if (opts.BUILD_EXTENDED) {
			return this.installExtended(opts);
		} else {
			return this.installSimple(opts);
		}
	}

	async run(opts: BuildHugoOptions): Promise<void> {
		const hugo_dir = path.resolve(opts.BUILD_SOURCE_DIR, '.hugo');
		const exists = await fse.pathExists(hugo_dir);
		if (!exists) {
			await this.install(opts);
		}
		try {
			return await this.build(opts);
		} catch (e) {
			await this.install(opts);
			return await this.build(opts);
		}
	}
}
