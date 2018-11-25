import { PublishActionBase, PublishActionOptions } from './action-base';
export declare class CopyPublishAction extends PublishActionBase<PublishActionOptions> {
    run(): Promise<void>;
}
