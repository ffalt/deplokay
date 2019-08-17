import { EmitFunction } from '..';
export interface PublishActionOptions {
    $schema?: string;
    id?: string;
    source: {
        local?: {
            path: string;
        };
        remote?: {
            branch: string;
            checkout_path: string;
            repository: string;
        };
    };
    build: {
        npm?: {
            cmd_name: string;
            component_names?: Array<string>;
            folder_names?: Array<string>;
            slim_package?: boolean;
        };
        hugo?: {
            version?: string;
            extended?: boolean;
        };
        jekyll?: {};
        copy?: {};
    };
    publish: {
        branch?: {
            branch: string;
            disableTag?: boolean;
        };
        folder?: {
            path: string;
        };
        archive?: {
            name?: string;
            path: string;
        };
    };
    env?: {
        [name: string]: string;
    };
}
export declare abstract class PublishActionBase<T extends PublishActionOptions> {
    protected opts: T;
    protected task: any;
    protected emit: EmitFunction;
    constructor(opts: T, task: any, emit: EmitFunction);
    validateOptions(): Promise<void>;
    abstract run(): Promise<void>;
    protected runSource(): Promise<{
        build_path: string;
        version: string;
        name: string;
    }>;
    runPublish(build_path: string, dist_path: string, name: string, version: string): Promise<void>;
}
