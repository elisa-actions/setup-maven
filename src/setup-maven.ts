import {getInput, setFailed} from '@actions/core';
import * as installer from './installer';

async function run() {
  try {
    let version = getInput('maven-version');
    let mirror = getInput('mirror');
    if (version) {
      await installer.getMaven(version, mirror);
    }
  } catch (error) {
    setFailed((error as Error).message);
  }
}

run();
