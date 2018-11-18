"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const utils_1 = require("../utils");
const run_base_1 = require("./run-base");
class BuildNPMRun extends run_base_1.Run {
    buildEnv(opts) {
        const env = Object.assign({ 'NODE_DISABLE_COLORS': 'true' }, opts.BUILD_ENV || {});
        return utils_1.buildEnv(env);
    }
    build(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.emit(__1.EmitType.OPERATION, 'building', `Building with NPM ${opts.BUILD_CMD} in ${opts.BUILD_SOURCE_DIR}`);
            const exec_options = {
                cwd: opts.BUILD_SOURCE_DIR,
                env: this.buildEnv(opts)
            };
            const result = yield this.execute(`npm run --no-color ${opts.BUILD_CMD}`, exec_options);
            yield this.emit(__1.EmitType.SUCCESS, 'build', result);
        });
    }
    execute(cmd, exec_options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { stdout } = yield utils_1.shellExec(cmd, exec_options);
            return (stdout || '');
        });
    }
    install(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.emit(__1.EmitType.OPERATION, 'installing', `Installing npm dependencies`);
            const exec_options = {
                cwd: opts.BUILD_SOURCE_DIR,
                env: this.buildEnv(opts)
            };
            const result = yield this.execute(`npm install -s --no-color -no-audit`, exec_options);
            yield this.emit(__1.EmitType.SUCCESS, 'installed', result);
        });
    }
    run(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.install(opts);
            yield this.build(opts);
        });
    }
}
exports.BuildNPMRun = BuildNPMRun;
//# sourceMappingURL=build-npm.js.map