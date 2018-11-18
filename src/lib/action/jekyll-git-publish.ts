import path from 'path';
import {BuildJekyllOptions, BuildJekyllRun} from '../run/build-jekyll';
import {PublishActionBase, PublishActionOptions} from './action-base';

export class JekyllPublishAction extends PublishActionBase<PublishActionOptions> {

	public async runJekyll(build_path: string): Promise<void> {
		const jekyllOptions: BuildJekyllOptions = {
			BUILD_SOURCE_DIR: build_path,
			BUILD_DEST_DIR: path.resolve(build_path, '_site'),
			BUILD_ENV: this.opts.env
		};
		const jekyll = new BuildJekyllRun(this.emit, this.task);
		await jekyll.run(jekyllOptions);
	}

	public async run(): Promise<void> {
		await this.validateOptions();
		const {build_path, version, name} = await this.runSource();
		await this.runJekyll(build_path);
		await this.runPublish(build_path, path.resolve(build_path, '_site'), name, version);
	}
}
