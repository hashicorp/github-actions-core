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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseVersion = exports.setupBinary = void 0;
const core = __importStar(require("@actions/core"));
const hc = __importStar(require("@hashicorp/js-releases"));
const io = __importStar(require("@actions/io"));
const cache = __importStar(require("@actions/tool-cache"));
const semver = __importStar(require("semver"));
const os_1 = __importDefault(require("os"));
const child_process_1 = __importDefault(require("child_process"));
const path_1 = __importDefault(require("path"));
const assert_1 = require("assert");
function setupBinary(binaryName, version) {
    return __awaiter(this, void 0, void 0, function* () {
        let userAgent = `setup-${binaryName} (GitHub Actions)`;
        let binaryPath = yield fetchBinary(binaryName, version, userAgent);
        core.addPath(binaryPath);
        core.info(`${binaryName}:${version} added to path`);
        let binary = yield io.which(binaryName);
        let binaryVersion = (child_process_1.default.execSync(`${binary} version`) || "").toString();
        core.setOutput("version", parseVersion(binaryVersion));
    });
}
exports.setupBinary = setupBinary;
function fetchBinary(binaryName, version, userAgent) {
    return __awaiter(this, void 0, void 0, function* () {
        const osPlatform = getPlatform();
        const osArch = getArch();
        const tmpDir = getTempDir();
        let binaryPath;
        core.debug(`Finding release that matches ${version}.`);
        const isValidVersion = semver.validRange(version);
        if (!isValidVersion && version !== "latest") {
            throw new Error("Invalid version, only valid semver versions or 'latest' are allowed");
        }
        let release = yield hc.getRelease(binaryName, version, userAgent);
        const nameAndVersion = binaryName + ` ` + version;
        const nameAndPlatform = binaryName + `_${osPlatform}`;
        core.debug(`Found ${nameAndVersion}.`);
        core.debug(`Checking cache for ${nameAndVersion}.`);
        core.debug(`Cache binary: ${nameAndPlatform}`);
        binaryPath = cache.find(nameAndPlatform, version);
        if (binaryPath) {
            core.debug(`Found ${nameAndVersion} in cache at ${binaryPath}.`);
            return binaryPath;
        }
        core.debug(`${nameAndVersion} not found in cache.`);
        core.debug(`Getting download URL for ${nameAndVersion}.`);
        let build = release.getBuild(osPlatform, osArch);
        core.debug(`Download URL: ${build.url}`);
        core.info(`Downloading ${build.filename}.`);
        let downloadPath = path_1.default.join(tmpDir, build.filename);
        core.debug(`Download path: ${downloadPath}`);
        yield release.download(build.url, downloadPath, userAgent);
        core.debug(`Verifying ${build.filename}.`);
        yield release.verify(downloadPath, build.filename);
        core.debug(`Extracting ${build.filename}.`);
        const extractedPath = yield cache.extractZip(downloadPath);
        core.debug(`Extracted path: ${extractedPath}`);
        binaryPath = yield cache.cacheDir(extractedPath, nameAndPlatform, version);
        core.debug(`Cached ${nameAndVersion} at ${binaryPath}.`);
        return binaryPath;
    });
}
function parseVersion(version) {
    return version.split("\n")[0].split(" ")[1];
}
exports.parseVersion = parseVersion;
function getTempDir() {
    const tmpDir = process.env["RUNNER_TEMP"] || "";
    (0, assert_1.ok)(tmpDir, "Expected RUNNER_TEMP to be defined");
    return tmpDir;
}
function getPlatform() {
    const platform = os_1.default.platform();
    switch (platform) {
        case "darwin":
            return "darwin";
        case "freebsd":
            return "freebsd";
        case "linux":
            return "linux";
        case "openbsd":
            return "openbsd";
        case "win32":
            return "windows";
        default:
            throw new Error(`Unsupported operating system platform: ${platform}`);
    }
}
function getArch() {
    const arch = os_1.default.arch();
    switch (arch) {
        case "arm":
            return "arm";
        case "arm64":
            return "arm64";
        case "x32":
            return "386";
        case "x64":
            return "amd64";
        default:
            throw new Error(`Unsupported operating system architecture: ${arch}`);
    }
}
//# sourceMappingURL=setup-binary.js.map