import * as core from "@actions/core";
import * as hc from "@hashicorp/js-releases";
import * as io from "@actions/io";
import * as cache from "@actions/tool-cache";
import * as sys from "./system";
import cp from "child_process";
import path from "path";
import { ok } from "assert";
import { download } from './utils'

const supportedBinaries = ["packer", "nomad", "nomad-pack"]

export async function setupBinary(binaryName: string, version: string) {
  let userAgent = `setup-${binaryName} (GitHub Actions)`;
  let binaryPath = await fetchBinary(version, binaryName, userAgent);

  if (!supportedBinaries.includes(binaryName)) {
     throw new Error(`Binary ${binaryName} is not supported, only packer, nomad, and nomad-pack are supported`)
  }
  core.info(`Adding ` + binaryName + ` to PATH.`);
  core.addPath(binaryPath);

  let binary = await io.which(binaryName);
  let binaryVersion = (cp.execSync(`${binary} version`) || "").toString();

  core.info(binaryVersion);
  core.setOutput("version", parseVersion(binaryVersion));
}

async function fetchBinary(binaryName: string, version: string, userAgent: string): Promise<string> {
  const osPlatform = sys.getPlatform();
  const osArch = sys.getArch();
  const tmpDir = getTempDir();

  let binaryPath: string;

  core.info(`Finding release that matches ${version}.`);
  core.info(`binaryName ${binaryName}.`);
  core.info(`version ${version}.`);
  core.info(`userAgent ${userAgent}.`);
  const nameAndVersion = binaryName + ` ` + version;
  const nameAndPlatform = binaryName + `_${osPlatform}`;

  if (version !== "nightly") {
    let release = await hc.getRelease(binaryName, version, userAgent);
    core.info(`Found ${nameAndVersion}.`);

    core.info(`Checking cache for ${nameAndVersion}.`);

    core.debug(`Cache binary: ${nameAndPlatform}`);
    binaryPath = cache.find(nameAndPlatform, version);

    if (binaryPath) {
      core.info(`Found ${nameAndVersion} in cache at ${binaryPath}.`);
      return binaryPath;
    }
    core.info(`${nameAndVersion} not found in cache.`);
    core.info(`Getting download URL for ${nameAndVersion}.`);
    let build = release.getBuild(osPlatform, osArch);
    core.debug(`Download URL: ${build.url}`);

    core.info(`Downloading ${build.filename}.`);
    let downloadPath = path.join(tmpDir, build.filename);

    core.debug(`Download path: ${downloadPath}`);
    await release.download(build.url, downloadPath, userAgent);

    core.info(`Verifying ${build.filename}.`);
    await release.verify(downloadPath, build.filename);

    core.info(`Extracting ${build.filename}.`);
    const extractedPath = await cache.extractZip(downloadPath);
    core.debug(`Extracted path: ${extractedPath}`);

    binaryPath = await cache.cacheDir(extractedPath, nameAndPlatform, version);
    core.info(`Cached ${nameAndVersion} at ${binaryPath}.`);

    return binaryPath;
  }
  else {
    core.warning("Nightly releases are not official HashiCorp releases, but dev builds published by individual teams, use with caution")

    if (binaryName !== "packer") {
      throw new Error("Nightly is only supported with packer")
    }

    core.info(`Downloading nightly release info`);
    let jsonPath = path.join(tmpDir, "metadata.json");
    await download(`https://github.com/hashicorp/${binaryName}/releases/nightly/metadata.json`, jsonPath, userAgent)
    const jsonData= require(path.join(tmpDir, "metadata.json"));
    let nightlyVersion = jsonData.version
    const nightlyFileName = binaryName + `_${nightlyVersion}_${osPlatform}.zip`
    core.info(`Trying to download nightly release ${nightlyFileName}`);
    let zipPath = path.join(tmpDir, nightlyFileName)
    await download(`https://github.com/hashicorp/packer/releases/download/nightly/${nightlyFileName}`, zipPath, userAgent)
    core.debug(`Extracting: ${zipPath}`);
    const extractedPath = await cache.extractZip(zipPath);
    core.debug(`Extracted path: ${extractedPath}`);
   // We don't cache the result since nightly is not a stable build, and will change within the same dev version
    return extractedPath;
  }
}

export function parseVersion(version: string): string {
  return version.split("\n")[0].split(" ")[1];
}

function getTempDir(): string {
  const tmpDir = process.env["RUNNER_TEMP"] || "";
  ok(tmpDir, "Expected RUNNER_TEMP to be defined");
  return tmpDir;
}
