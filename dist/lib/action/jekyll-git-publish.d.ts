import { PublishActionBase, PublishActionOptions } from './action-base';
export declare class JekyllPublishAction extends PublishActionBase<PublishActionOptions> {
    runJekyll(build_path: string): Promise<void>;
    run(): Promise<void>;
}
