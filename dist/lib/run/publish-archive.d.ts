import { Run } from './run-base';
export interface PublishToArchiveRunOptions {
    SOURCE_DIR: string;
    NAME: string;
    VERSION: string;
    ARCHIVE_DIR: string;
}
export declare class PublishToArchiveRun extends Run<PublishToArchiveRunOptions> {
    private archive;
    run(opts: PublishToArchiveRunOptions): Promise<void>;
}
