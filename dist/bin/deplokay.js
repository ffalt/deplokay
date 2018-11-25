"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const index_1 = require("../lib/index");
const npm_git_publish_1 = require("../lib/action/npm-git-publish");
const jekyll_git_publish_1 = require("../lib/action/jekyll-git-publish");
const hugo_git_publish_1 = require("../lib/action/hugo-git-publish");
const consts_1 = require("../consts");
const copy_git_publish_1 = require("../lib/action/copy-git-publish");
const manifest = require(path_1.default.resolve(__dirname, '../../package.json'));
function parameterList(str, list) {
    list.push(str);
    return list;
}
function parameterBool(val) {
    return val === 'true' || val === 'yes' || val === '1';
}
class DeplokayCLI {
    emit(task, type, state, details) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (type) {
                case index_1.EmitType.LOG:
                    if (details.length > 0) {
                        console.log(' ', chalk_1.default.gray(details));
                    }
                    return;
                case index_1.EmitType.DONE:
                    state = chalk_1.default.green(state);
                    break;
                case index_1.EmitType.FINISH:
                    state = chalk_1.default.green(state);
                    break;
                case index_1.EmitType.ERROR:
                    state = chalk_1.default.red(state);
                    break;
                case index_1.EmitType.OPERATION:
                    state = chalk_1.default.cyan(state);
                    break;
                case index_1.EmitType.SUCCESS:
                    state = chalk_1.default.greenBright(state);
                    details = chalk_1.default.gray(details);
                    break;
            }
            const taskPrefix = task.id ? `[${task.id}] ` : '';
            const line = `${taskPrefix}${state}${(type === index_1.EmitType.SUCCESS && (details.length > 0) ? '\n' : ' ')}${details}`;
            console.log(line);
        });
    }
    programOptions(prog) {
        prog
            .option('--id [id]', 'id for the task')
            .option('--mode <mode>', 'kind of project to publish (npm|jekyll|hugo|copy)')
            .option('--local [path]', '[source.local] local git repository path')
            .option('--repository [url]', '[source.remote] git repository url')
            .option('--branch [name]', '[source.remote] branch to publish e.g. "master"')
            .option('--checkout_path [path]', '[source.remote] working directory to checkout and build')
            .option('--npm_release_component [name]', '[build.npm] a file or folder name to copy to the release folder, e.g. "dist" or "package.json" (multiple --nc allowed)', parameterList, [])
            .option('--npm_release_folder [name]', '[build.npm] a folder name to copy its content to the release folder, e.g. "dist"  (multiple --nf allowed)', parameterList, [])
            .option('--npm_cmd_name [name]', '[build.npm] npm build script name e.g. "build:deploy"')
            .option('--npm_slim_package [boolean]', '[build.npm] strip development dependencies from package.json and generate a slim package-lock.json', parameterBool, false)
            .option('--hugo_version [version]', '[build.hugo] hugo version to download', consts_1.DEFAULT_HUGO_VERSION)
            .option('--hugo_extended [boolean]', '[build.hugo] npm build script name e.g. "build:prod"', parameterBool, false)
            .option('--archive_path [path]', '[publish.archive] destination directory for compressed archive files to publish')
            .option('--archive_name [name]', '[publish.archive] base name for the archive file e.g. "project-pack"')
            .option('--publish_path [path]', '[publish.folder] destination directory to publish')
            .option('--target_branch [name]', '[publish.branch] destination branch to publish')
            .option('-d, --disable_colors', 'no colored output');
    }
    cliOptions(prog) {
        const result = {
            id: prog.id || '',
            source: {},
            build: {},
            publish: {}
        };
        if (prog.local) {
            result.source.local = {
                path: prog.local,
            };
        }
        if (prog.repository || prog.branch || prog.checkout_path) {
            result.source.remote = {
                repository: prog.repository,
                branch: prog.branch,
                checkout_path: prog.checkout_path,
            };
        }
        switch (prog.mode) {
            case 'npm':
                result.build.npm = {
                    slim_package: prog.npm_slim_package,
                    folder_names: prog.npm_release_folder,
                    component_names: prog.npm_release_component,
                    cmd_name: prog.npm_cmd_name
                };
                break;
            case 'jekyll':
                result.build.jekyll = {};
                break;
            case 'copy':
                result.build.copy = {};
                break;
            case 'hugo':
                result.build.hugo = {
                    version: prog.hugo_version,
                    extended: prog.hugo_extended,
                };
                break;
        }
        if (prog.archive_path || prog.archive_name) {
            result.publish.archive = {
                path: prog.archive_path,
                name: prog.archive_name
            };
        }
        if (prog.publish_path) {
            result.publish.folder = {
                path: prog.publish_path
            };
        }
        if (prog.target_branch) {
            result.publish.branch = {
                branch: prog.target_branch
            };
        }
        return result;
    }
    run(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            let action;
            if (opts.build.npm) {
                action = new npm_git_publish_1.NPMPublishAction(opts, { id: opts.id }, this.emit);
            }
            else if (opts.build.jekyll) {
                action = new jekyll_git_publish_1.JekyllPublishAction(opts, { id: opts.id }, this.emit);
            }
            else if (opts.build.hugo) {
                action = new hugo_git_publish_1.HugoPublishAction(opts, { id: opts.id }, this.emit);
            }
            else if (opts.build.copy) {
                action = new copy_git_publish_1.CopyPublishAction(opts, { id: opts.id }, this.emit);
            }
            else {
                return Promise.reject('Invalid Build Mode');
            }
            yield action.run();
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            commander_1.default
                .version(manifest.version)
                .option('-c, --config [filename]', 'specify a json config file');
            this.programOptions(commander_1.default);
            commander_1.default.parse(process.argv);
            if (commander_1.default.no_colors) {
                chalk_1.default.enabled = false;
            }
            let options;
            if (commander_1.default.config) {
                options = yield fs_extra_1.default.readJson(commander_1.default.config);
            }
            else {
                options = this.cliOptions(commander_1.default);
            }
            yield this.emit({ id: options.id }, index_1.EmitType.OPERATION, 'start', 'Checking Parameters');
            this.run(options).then(() => {
                return this.emit({ id: options.id }, index_1.EmitType.FINISH, chalk_1.default.magenta('done'), '🍓');
            }).catch(e => {
                return this.emit({ id: options.id }, index_1.EmitType.ERROR, 'error', e.toString());
            });
        });
    }
    main() {
        this.start();
    }
}
exports.DeplokayCLI = DeplokayCLI;
const cli = new DeplokayCLI();
cli.main();
//# sourceMappingURL=deplokay.js.map