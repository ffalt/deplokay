import path from 'path';
import {PublishActionBase, PublishActionOptions} from './action-base';
import {BuildHugoOptions, BuildHugoRun} from '../run/build-hugo';
import {DEFAULT_HUGO_VERSION} from '../../consts';

export class HugoPublishAction extends PublishActionBase<PublishActionOptions> {

	public async runHugo(build_path: string): Promise<void> {
		const hugoOptions: BuildHugoOptions = {
			BUILD_SOURCE_DIR: build_path,
			BUILD_DEST_DIR: path.resolve(build_path, '_site'),
			BUILD_VERSION: this.opts.build && this.opts.build.hugo && this.opts.build.hugo.version ? this.opts.build.hugo.version : DEFAULT_HUGO_VERSION,
			BUILD_EXTENDED: this.opts.build && this.opts.build.hugo && this.opts.build.hugo.extended !== undefined ? this.opts.build.hugo.extended : false,
			BUILD_ENV: this.opts.env
		};
		const hugo = new BuildHugoRun(this.emit, this.task);
		await hugo.run(hugoOptions);
	}

	public async run(): Promise<void> {
		await this.validateOptions();
		const {build_path, version, name} = await this.runSource();
		await this.runHugo(build_path);
		await this.runPublish(build_path, path.resolve(build_path, '_site'), name, version);
	}
}
