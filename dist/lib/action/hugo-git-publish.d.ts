import { PublishActionBase, PublishActionOptions } from './action-base';
export declare class HugoPublishAction extends PublishActionBase<PublishActionOptions> {
    runHugo(build_path: string): Promise<void>;
    run(): Promise<void>;
}
