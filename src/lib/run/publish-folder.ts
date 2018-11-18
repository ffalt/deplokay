import {EmitType} from '..';
import fse from 'fs-extra';
import path from 'path';
import {Run} from './run-base';

export interface PublishToFolderRunOptions {
	SOURCE_DIR: string;
	PUBLISH_DIR: string;
}

export class PublishToFolderRun extends Run<PublishToFolderRunOptions> {

	async run(opts: PublishToFolderRunOptions): Promise<void> {
		opts = Object.assign({}, opts);
		let exists = await fse.pathExists(opts.SOURCE_DIR);
		if (!exists) {
			return Promise.reject(`Publishing source path does not exists ${opts.SOURCE_DIR}`);
		}
		// backupPublishFolder
		const tmp_dest_dir = path.resolve(opts.PUBLISH_DIR + '_backup');
		exists = await fse.pathExists(opts.PUBLISH_DIR);
		if (exists) {
			await this.emit(EmitType.OPERATION, 'storing', `Backing up ${opts.PUBLISH_DIR}`);
			await fse.move(opts.PUBLISH_DIR, tmp_dest_dir);
		}
		try {
			// copyPublishFolder
			await this.emit(EmitType.OPERATION, 'publishing', `Publishing to ${opts.PUBLISH_DIR}`);
			await fse.copy(opts.SOURCE_DIR, opts.PUBLISH_DIR);
		} catch (e) {
			// restorePublishFolder
			await fse.move(tmp_dest_dir, opts.PUBLISH_DIR);
			return Promise.reject(e);
		}
		// removeBackupFolder
		await this.emit(EmitType.OPERATION, 'cleaning', `Removing backup ${tmp_dest_dir}`);
		await fse.remove(tmp_dest_dir);

		await this.emit(EmitType.DONE, 'published', `Published to ${opts.PUBLISH_DIR}`);
	}

}
