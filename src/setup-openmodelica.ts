import * as core from '@actions/core'

import * as installer from './installer'

export async function run(): Promise<void> {
  try {
    core.debug('Starting run')
    // Inputs
    const versionInput = core.getInput('version')
    const releaseType = core.getInput('releaseType')
    const availableReleases = ['release', 'stable', 'nightly']
    if (!availableReleases.includes(releaseType)) {
      throw new Error(`Not a valid release type ${releaseType}`)
    }
    const architectureInput = core.getInput('architecture')
    const availableArchitectures = ['64', '32']
    if (!availableArchitectures.includes(architectureInput)) {
      throw new Error(`Not a valid release type ${architectureInput}`)
    }

    const version = installer.getOMVersion(versionInput)
    core.debug(`Installing OpenModelica ${version}`)

    // Install OpenModelica
    await installer.installOM(version, releaseType, architectureInput)

    // TODO: Cache OpenModelica

    // Test if OpenModelica is installed
    await installer.showVersion()
  } catch (error) {
    core.debug('Caught error')
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
