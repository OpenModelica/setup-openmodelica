import * as core from '@actions/core'

import * as installer from './installer'

export async function run(): Promise<void> {
  try {
    core.debug('Starting run')
    // Inputs
    const versionInput = core.getInput('version')

    if (!versionInput) {
      throw new Error('Version input must not be null')
    }

    const version = installer.getOMVersion(versionInput)
    core.debug(`Installing OpenModelica ${version}`)

    // Install OpenModelica
    await installer.installOM(versionInput)

    // TODO: Cache OpenModelica

    // Test if OpenModelica is installed
    await installer.showVersion()
  } catch (error) {
    core.debug('Catched error')
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
