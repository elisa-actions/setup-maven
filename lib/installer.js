"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaven = getMaven;
// Load tempDirectory before it gets wiped by tool-cache
let tempDirectory = process.env['RUNNER_TEMPDIRECTORY'] || '';
const core = __importStar(require("@actions/core"));
const tc = __importStar(require("@actions/tool-cache"));
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
if (!tempDirectory) {
    let baseLocation;
    if (process.platform === 'win32') {
        baseLocation = process.env['USERPROFILE'] || 'C:\\';
    }
    else {
        if (process.platform === 'darwin') {
            baseLocation = '/Users';
        }
        else {
            baseLocation = '/home';
        }
    }
    tempDirectory = path.join(baseLocation, 'actions', 'temp');
}
function getMaven(version, mirror) {
    return __awaiter(this, void 0, void 0, function* () {
        let toolPath;
        toolPath = tc.find('maven', version);
        if (!toolPath) {
            toolPath = yield downloadMaven(version, mirror);
        }
        toolPath = path.join(toolPath, 'bin');
        core.addPath(toolPath);
    });
}
function downloadMaven(version, mirror) {
    return __awaiter(this, void 0, void 0, function* () {
        const toolDirectoryName = `apache-maven-${version}`;
        const mirrorHost = mirror || process.env['MAVEN_CENTRAL_MIRROR'] || 'repo.maven.apache.org';
        const downloadUrl = `https://${mirrorHost}/maven2/org/apache/maven/apache-maven/${version}/apache-maven-${version}-bin.tar.gz`;
        console.log(`downloading ${downloadUrl}`);
        try {
            const downloadPath = yield tc.downloadTool(downloadUrl);
            const checksumPath = yield tc.downloadTool(`${downloadUrl}.sha1`);
            const expectedChecksum = (yield fs.promises.readFile(checksumPath, 'utf8')).trim();
            const actualChecksum = crypto
                .createHash('sha1')
                .update(yield fs.promises.readFile(downloadPath))
                .digest('hex');
            if (actualChecksum !== expectedChecksum) {
                throw new Error(`SHA1 checksum mismatch for ${downloadUrl}: expected ${expectedChecksum}, got ${actualChecksum}`);
            }
            const extractedPath = yield tc.extractTar(downloadPath);
            let toolRoot = path.join(extractedPath, toolDirectoryName);
            return yield tc.cacheDir(toolRoot, 'maven', version);
        }
        catch (err) {
            throw err;
        }
    });
}
