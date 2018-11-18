import path from 'path';
import {BuildNPMOptions, BuildNPMRun} from '../run/build-npm';
import {PublishActionBase, PublishActionOptions} from './action-base';
import {getManifest} from '../utils';
import tmp from 'tmp-promise';
import fse from 'fs-extra';
import {CombineReleaseOptions, CombineReleaseRun} from '../run/combine-release';

export class NPMPublishAction extends PublishActionBase<PublishActionOptions> {

	public async run(): Promise<void> {
		await this.validateOptions();
		const {build_path} = await this.runSource();
		const manifest = await getManifest(build_path);
		if (manifest.version === null) {
			return Promise.reject(`Version from package.json could not be read. Exiting...`);
		}
		const npmRunOptions: BuildNPMOptions = {
			BUILD_SOURCE_DIR: path.resolve(build_path),
			BUILD_CMD: this.opts.build && this.opts.build.npm && this.opts.build.npm.cmd_name ? this.opts.build.npm.cmd_name : '',
			BUILD_ENV: this.opts.env
		};
		const npm = new BuildNPMRun(this.emit, this.task);
		await npm.run(npmRunOptions);

		const release_tmp = await tmp.dir();
		try {
			const combineReleaseOptions: CombineReleaseOptions = {
				SOURCE_DIR: build_path,
				RELEASE_DIR: release_tmp.path,
				FOLDERS: this.opts.build && this.opts.build.npm && this.opts.build.npm.folder_names ? this.opts.build.npm.folder_names : [],
				COMPONENTS: this.opts.build && this.opts.build.npm && this.opts.build.npm.component_names ? this.opts.build.npm.component_names : [],
				GENERATE_SLIM_PACKAGE: this.opts.build && this.opts.build.npm && (this.opts.build.npm.slim_package !== undefined) ? this.opts.build.npm.slim_package : false,
				BUILD_ENV: this.opts.env
			};
			const combine = new CombineReleaseRun(this.emit, this.task);
			await combine.run(combineReleaseOptions);

			await this.runPublish(build_path, release_tmp.path, manifest.name, manifest.version);
			await fse.remove(release_tmp.path);
		} catch (e) {
			await fse.remove(release_tmp.path);
			return Promise.reject(e);
		}
	}

}
