import {EmitType} from '..';
import fse from 'fs-extra';
import {Run} from './run-base';
import archiver from 'archiver';

export interface PublishToArchiveRunOptions {
	SOURCE_DIR: string;
	NAME: string;
	VERSION: string;
	ARCHIVE_DIR: string;
}

export class PublishToArchiveRun extends Run<PublishToArchiveRunOptions> {

	private async archive(sourceDir: string, destfile: string): Promise<number> {
		const output = fse.createWriteStream(destfile);
		const archive = archiver('zip', {zlib: {level: 9}});
		return new Promise<number>((resolve, reject) => {
			output.on('close', () => resolve(archive.pointer()));
			archive.on('warning', err => {
				if (err.code === 'ENOENT') {
					// log warning
				} else {
					// throw error
					throw err;
				}
			});
			archive.on('error', err => {
				throw err;
			});
			archive.pipe(output);
			archive.directory(sourceDir, false);
			archive.finalize();
		});
	}

	async run(opts: PublishToArchiveRunOptions): Promise<void> {
		const exists = await fse.pathExists(opts.SOURCE_DIR);
		if (!exists) {
			return Promise.reject(`Publishing source path does not exists ${opts.SOURCE_DIR}`);
		}
		await fse.ensureDir(opts.ARCHIVE_DIR);
		const destfile = `${opts.ARCHIVE_DIR}/${opts.NAME}-${opts.VERSION}.zip`;
		const size = await this.archive(opts.SOURCE_DIR, destfile);
		await this.emit(EmitType.DONE, 'published', `Published to ${destfile} - ${size} bytes`);
	}

}
