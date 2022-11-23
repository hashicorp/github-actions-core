import * as core from "@actions/core";
import { setupBinary } from "./setup-binary";

export async function getHashicorpRelease(binary: string, version: string) {
  core.info(`binary ${binary}`);
  core.info(`version ${version}`);

  try {
    await setupBinary(binary, version);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}
