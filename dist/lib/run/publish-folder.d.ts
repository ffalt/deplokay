import { Run } from './run-base';
export interface PublishToFolderRunOptions {
    SOURCE_DIR: string;
    PUBLISH_DIR: string;
}
export declare class PublishToFolderRun extends Run<PublishToFolderRunOptions> {
    run(opts: PublishToFolderRunOptions): Promise<void>;
}
