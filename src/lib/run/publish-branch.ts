import fse from 'fs-extra';
import {EmitType} from '..';
import {checkoutRemoteBranch, cloneLocalGit, createAndPushEmptyBranch, getManifestVersion, hasRemoteBranch} from '../utils';
import {Run} from './run-base';

const SimpleGit = require('simple-git/promise');

export interface PublishToBranchRunOptions {
	GIT_DIR: string;
	SOURCE_DIR: string;
	RELEASE_DIR: string;
	RELEASE_BRANCH: string;
}

export class PublishToBranchRun extends Run<PublishToBranchRunOptions> {

	async isUpdateNeeded(opts: PublishToBranchRunOptions): Promise<{ needed: boolean, version: string }> {
		const version = await getManifestVersion(opts.GIT_DIR);
		if (version === null) {
			return Promise.reject(`Version from package.json could not be read. Exiting...`);
		}
		const sourcegit = new SimpleGit(opts.GIT_DIR);
		await sourcegit.pull();
		const tags = await sourcegit.tags();
		if (tags.all.indexOf('v' + version) >= 0) {
			await this.emit(EmitType.DONE, 'done', `Version ${version} is already released.`);
			return {needed: false, version};
		}
		return {needed: false, version};
	}

	async run(opts: PublishToBranchRunOptions): Promise<void> {
		const version = await getManifestVersion(opts.GIT_DIR);
		if (version === null) {
			return Promise.reject(`Version from package.json could not be read. Exiting...`);
		}
		const sourcegit = new SimpleGit(opts.GIT_DIR);
		await sourcegit.pull();
		const tags = await sourcegit.tags();
		if (tags.all.indexOf(version) >= 0) {
			await this.emit(EmitType.DONE, 'done', `Version ${version} is already released. Exiting...`);
			return;
		}
		const exists = await fse.pathExists(opts.RELEASE_DIR);
		if (exists) {
			await this.emit(EmitType.OPERATION, 'cleaning', `Cleaning up ${opts.RELEASE_DIR}`);
			await fse.remove(opts.RELEASE_DIR);
		}
		await this.emit(EmitType.OPERATION, 'cloning', `Cloning to ${opts.RELEASE_DIR}`);
		const destgit = await cloneLocalGit(sourcegit, opts.GIT_DIR, opts.RELEASE_DIR);
		const hasBranch = await hasRemoteBranch(destgit, opts.RELEASE_BRANCH);
		if (hasBranch) {
			await this.emit(EmitType.OPERATION, 'checkout', `Checkout Release Branch ${opts.RELEASE_BRANCH}`);
			await checkoutRemoteBranch(destgit, opts.RELEASE_BRANCH);
		} else {
			await this.emit(EmitType.OPERATION, 'creating', `Creating Release Branch ${opts.RELEASE_BRANCH}`);
			await createAndPushEmptyBranch(destgit, opts.RELEASE_DIR, opts.RELEASE_BRANCH);
		}
		await destgit.rm(['-rf', '.']);
		await this.emit(EmitType.OPERATION, 'copying', `Copy dist ${opts.SOURCE_DIR} to ${opts.RELEASE_DIR}`);
		await fse.copy(opts.SOURCE_DIR, opts.RELEASE_DIR);
		await this.emit(EmitType.OPERATION, 'commiting', `Commit Version ${version}`);
		await destgit.add('.');
		await destgit.commit(version);
		await this.emit(EmitType.OPERATION, 'tagging', `Tag Version ${version}`);
		await destgit.tag([`v${version}`]);
		await destgit.push('origin', opts.RELEASE_BRANCH);
		await destgit.push('origin', '--tags');
		await this.emit(EmitType.OPERATION, 'cleaning', `Cleaning up ${opts.RELEASE_DIR}`);
		await fse.remove(opts.RELEASE_DIR);
	}

}
