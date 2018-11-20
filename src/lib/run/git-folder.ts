import path from 'path';
import fse from 'fs-extra';
import {EmitType} from '..';
import {Run} from './run-base';

const SimpleGit = require('simple-git/promise');

export interface GitFolderOptions {
	GIT_REPO: string;
	GIT_DIR: string;
	GIT_BRANCH: string;
}

export class GitFolderRun extends Run<GitFolderOptions> {

	async run(opts: GitFolderOptions): Promise<void> {
		// var branch = site.branch;
		// if (task.data.ref) {
		// 	branch = task.data.ref.replace('refs/heads/', '');
		// }
		// if (site.branch && site.branch !== branch) {
		// 	var err = 'Invalid branch config ' + site.branch + ' !== ' + branch;
		// 	emit('error', task, err);
		// 	return cb(err);
		// }
		await fse.mkdirp(opts.GIT_DIR);
		let exists = await fse.pathExists(opts.GIT_DIR);
		if (!exists) {
			return Promise.reject(`Directory ${opts.GIT_DIR} must exist`);
		}
		const git = new SimpleGit(opts.GIT_DIR);
		git.outputHandler((command: string, stdout: any, stderr: any) => {
			stdout.on('data', (data: Buffer) => {
				this.emit(EmitType.LOG, '', data.toString());
			});
			// stderr.pipe(process.stderr);
		});
		exists = await fse.pathExists(path.resolve(opts.GIT_DIR, '.git'));
		if (!exists) {
			await this.emit(EmitType.OPERATION, 'cloning', `Cloning repo ${opts.GIT_REPO} to ${opts.GIT_DIR}`);
			await git.clone(opts.GIT_REPO, opts.GIT_DIR);
			const branches = await git.branch([]);
			if (branches.current !== opts.GIT_BRANCH) {
				await this.emit(EmitType.OPERATION, 'checkout', `Checkout Branch ${opts.GIT_BRANCH}`);
				await git.checkoutBranch(opts.GIT_BRANCH, 'origin/' + opts.GIT_BRANCH);
			}
		}
		try {
			await this.emit(EmitType.OPERATION, 'updating', `Pulling ${opts.GIT_REPO} Branch ${opts.GIT_BRANCH}`);
			await git.pull('origin', opts.GIT_BRANCH);
		} catch (e) {
			await this.emit(EmitType.OPERATION, 'resetting', `Resetting ${opts.GIT_DIR} Branch ${opts.GIT_BRANCH}`);
			await git.reset(['--hard', 'origin/' + opts.GIT_BRANCH]);
			await this.emit(EmitType.OPERATION, 'updating', `Pulling ${opts.GIT_REPO} Branch ${opts.GIT_BRANCH}`);
			await git.pull('origin', opts.GIT_BRANCH);
		}
	}

}
