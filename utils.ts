import axiosBase from 'axios';
import * as stream from 'stream';
import * as fs from 'fs';
import * as core from "@actions/core";
import {promisify} from 'util';

const HttpsProxyAgent = require('https-proxy-agent');
const finished = promisify(stream.finished);

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

const axios = axiosBase.create({ ...proxyConf });

export async function download<T = any>(url: string, downloadPath: string, userAgent: string): Promise<T> {
  const headers = { 'User-Agent': userAgent };
  core.info(`Downloading ${url}.`);
  const writer = fs.createWriteStream(downloadPath);
  const result = await axios.get(url, {headers: { ...headers}});
  result.data.pipe(writer);
  await finished(writer);
  return result.data;
}
