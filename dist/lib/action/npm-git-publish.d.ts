import { PublishActionBase, PublishActionOptions } from './action-base';
export declare class NPMPublishAction extends PublishActionBase<PublishActionOptions> {
    run(): Promise<void>;
}
