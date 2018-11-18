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
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const __1 = require("..");
const utils_1 = require("../utils");
const run_base_1 = require("./run-base");
class BuildJekyllRun extends run_base_1.Run {
    hasBuildErrorMsg(text) {
        return this.hasInstallErrorMsg(text);
    }
    hasInstallErrorMsg(text) {
        const reg = /(missing gem executables|Could not locate Gemfile|command not found|GemNotFound|error)/i;
        return !!text.match(reg);
    }
    build(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.emit(__1.EmitType.OPERATION, 'building', `Building Jekyll ${opts.BUILD_SOURCE_DIR}`);
            const exec_options = {
                cwd: opts.BUILD_SOURCE_DIR,
                env: utils_1.buildEnv(opts.BUILD_ENV)
            };
            const gemfile = path_1.default.resolve(opts.BUILD_SOURCE_DIR, 'Gemfile');
            yield this.ensureGemfile(gemfile);
            exec_options.env['BUNDLE_GEMFILE'] = gemfile;
            let result = yield this.execute(`bundle exec jekyll build -d ${opts.BUILD_DEST_DIR}`, exec_options);
            if (this.hasBuildErrorMsg(result)) {
                if (result.indexOf('Generating... \n') >= 0) {
                    result = result.split('Generating... \n')[1];
                    if (result.indexOf('done.') >= 0) {
                        result = result.split('done.')[0];
                    }
                }
                return Promise.reject(result);
            }
            if (result.indexOf('Generating... \n') >= 0) {
                result = result.split('Generating... \n')[1];
                if (result.indexOf('done.') >= 0) {
                    result = result.split('done.')[0];
                }
            }
            yield this.emit(__1.EmitType.SUCCESS, 'build', result);
        });
    }
    ensureGemfile(gemfile) {
        return __awaiter(this, void 0, void 0, function* () {
            const exists = yield fs_extra_1.default.pathExists(gemfile);
            if (!exists) {
                const gem = `source 'https://rubygems.org'
gem 'jekyll'
gem 'github-pages'`;
                yield fs_extra_1.default.writeFile(gemfile, gem);
            }
        });
    }
    execute(cmd, exec_options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { stdout, stderr } = yield utils_1.shellExec(cmd, exec_options);
            const result = (stdout || '') + (stderr || '');
            return result.replace(/\[31m /g, '').replace(/\[0m/g, '');
        });
    }
    install(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const gemfile = path_1.default.resolve(opts.BUILD_SOURCE_DIR, 'Gemfile');
            yield this.ensureGemfile(gemfile);
            const jekyll_dir = path_1.default.resolve(opts.BUILD_SOURCE_DIR, '.gem');
            yield this.emit(__1.EmitType.OPERATION, 'installing', `Installing Jekyll into ${jekyll_dir}`);
            const exec_options = {
                cwd: opts.BUILD_SOURCE_DIR,
                env: utils_1.buildEnv(opts.BUILD_ENV)
            };
            const result = yield this.execute(`bundle install --gemfile=${gemfile} --path ${jekyll_dir}`, exec_options);
            if (this.hasInstallErrorMsg(result)) {
                return Promise.reject(result);
            }
            yield this.emit(__1.EmitType.SUCCESS, 'installed', result);
        });
    }
    run(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const jekyll_dir = path_1.default.resolve(opts.BUILD_SOURCE_DIR, '.gem');
            const exists = yield fs_extra_1.default.pathExists(jekyll_dir);
            if (!exists) {
                yield this.install(opts);
            }
            try {
                return yield this.build(opts);
            }
            catch (e) {
                const err = e.toString();
                if (this.hasInstallErrorMsg(err)) {
                    yield this.install(opts);
                    return yield this.build(opts);
                }
                else {
                    return Promise.reject(err);
                }
            }
        });
    }
}
exports.BuildJekyllRun = BuildJekyllRun;
//# sourceMappingURL=build-jekyll.js.map