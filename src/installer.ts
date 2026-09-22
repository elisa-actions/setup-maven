// Load tempDirectory before it gets wiped by tool-cache
let tempDirectory = process.env['RUNNER_TEMPDIRECTORY'] || '';

import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

if (!tempDirectory) {
  let baseLocation: string;
  if (process.platform === 'win32') {
    baseLocation = process.env['USERPROFILE'] || 'C:\\';
  } else {
    if (process.platform === 'darwin') {
      baseLocation = '/Users';
    } else {
      baseLocation = '/home';
    }
  }
  tempDirectory = path.join(baseLocation, 'actions', 'temp');
}

export async function getMaven(version: string, mirror?: string) {
  let toolPath: string;
  toolPath = tc.find('maven', version);

  if (!toolPath) {
    toolPath = await downloadMaven(version, mirror);
  }

  toolPath = path.join(toolPath, 'bin');
  core.addPath(toolPath);
}

async function downloadMaven(
  version: string,
  mirror?: string
): Promise<string> {
  const toolDirectoryName = `apache-maven-${version}`;
  const mirrorHost =
    mirror || process.env['MAVEN_CENTRAL_MIRROR'] || 'repo.maven.apache.org';
  const downloadUrl = `https://${mirrorHost}/maven2/org/apache/maven/apache-maven/${version}/apache-maven-${version}-bin.tar.gz`;
  console.log(`downloading ${downloadUrl}`);

  try {
    const downloadPath = await tc.downloadTool(downloadUrl);
    const checksumPath = await tc.downloadTool(`${downloadUrl}.sha1`);
    const expectedChecksum = (
      await fs.promises.readFile(checksumPath, 'utf8')
    ).trim();
    const actualChecksum = crypto
      .createHash('sha1')
      .update(await fs.promises.readFile(downloadPath))
      .digest('hex');

    if (actualChecksum !== expectedChecksum) {
      throw new Error(
        `SHA1 checksum mismatch for ${downloadUrl}: expected ${expectedChecksum}, got ${actualChecksum}`
      );
    }

    const extractedPath = await tc.extractTar(downloadPath);
    let toolRoot = path.join(extractedPath, toolDirectoryName);
    return await tc.cacheDir(toolRoot, 'maven', version);
  } catch (err) {
    throw err;
  }
}
