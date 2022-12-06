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
exports.download = void 0;
const axios_1 = __importDefault(require("axios"));
const stream = __importStar(require("stream"));
const fs = __importStar(require("fs"));
const core = __importStar(require("@actions/core"));
const util_1 = require("util");
const HttpsProxyAgent = require('https-proxy-agent');
const finished = (0, util_1.promisify)(stream.finished);
const httpProxy = process.env['HTTP_PROXY'] || process.env['http_proxy'];
const httpsProxy = process.env['HTTPS_PROXY'] || process.env['https_proxy'];
let proxyConf = {};
if (httpProxy || httpsProxy) {
    proxyConf = {
        proxy: false,
        httpAgent: httpProxy ? new HttpsProxyAgent(httpProxy) : undefined,
        httpsAgent: httpsProxy ? new HttpsProxyAgent(httpsProxy) : undefined,
    };
}
const axios = axios_1.default.create(Object.assign({}, proxyConf));
function download(url, downloadPath, userAgent) {
    return __awaiter(this, void 0, void 0, function* () {
        const headers = { 'User-Agent': userAgent };
        core.info(`Downloading ${url}.`);
        const writer = fs.createWriteStream(downloadPath);
        const result = yield axios.get(url, { headers: Object.assign({}, headers) });
        result.data.pipe(writer);
        yield finished(writer);
        return result.data;
    });
}
exports.download = download;
//# sourceMappingURL=utils.js.map