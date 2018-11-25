import {PublishActionBase, PublishActionOptions} from './action-base';

export class CopyPublishAction extends PublishActionBase<PublishActionOptions> {

	public async run(): Promise<void> {
		await this.validateOptions();
		const {build_path, version, name} = await this.runSource();
		await this.runPublish(build_path, build_path, name, version);
	}

}
