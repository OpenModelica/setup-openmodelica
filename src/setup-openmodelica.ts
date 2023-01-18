import * as core from '@actions/core'

import * as installer from './installer'

export async function run(): Promise<void> {
  try {
    core.debug('Starting run')
    // Inputs
    let versionInput: string = core.getInput('version')
    if (!versionInput) {
      versionInput = 'release'
    }

    const architectureInput = core.getInput('architecture')
    const availableArchitectures = ['64', '32']
    if (!availableArchitectures.includes(architectureInput)) {
      throw new Error(`Not a valid release type ${architectureInput}`)
    }

    let packagesInput: string[] = core.getMultilineInput('packages')
    if (!packagesInput) {
      packagesInput = ['omc']
    }

    const version = installer.getOMVersion(versionInput)
    core.debug(`Installing OpenModelica ${version.version}`)

    // Install OpenModelica
    await installer.installOM(packagesInput, version, architectureInput)

    // TODO: Cache OpenModelica

    // Test if OpenModelica programms are installed
    for(const pkg of packagesInput) {
      switch (pkg) {
        case 'omc':
          await installer.showVersion('omc')
          break;
        case 'omsimulator':
          await installer.showVersion('OMSimulator')
          break;
        default:
          break;
      }
    }
  } catch (error) {
    core.debug('Caught error')
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
