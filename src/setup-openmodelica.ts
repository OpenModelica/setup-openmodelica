/*
 * This file is part of OpenModelica.
 *
 * Copyright (c) 1998-2024, Open Source Modelica Consortium (OSMC),
 * c/o Linköpings universitet, Department of Computer and Information Science,
 * SE-58183 Linköping, Sweden.
 *
 * All rights reserved.
 *
 * THIS PROGRAM IS PROVIDED UNDER THE TERMS OF AGPL VERSION 3 LICENSE OR
 * THIS OSMC PUBLIC LICENSE (OSMC-PL) VERSION 1.8.
 * ANY USE, REPRODUCTION OR DISTRIBUTION OF THIS PROGRAM CONSTITUTES
 * RECIPIENT'S ACCEPTANCE OF THE OSMC PUBLIC LICENSE OR THE GNU AGPL
 * VERSION 3, ACCORDING TO RECIPIENTS CHOICE.
 *
 * The OpenModelica software and the OSMC (Open Source Modelica Consortium)
 * Public License (OSMC-PL) are obtained from OSMC, either from the above
 * address, from the URLs:
 * http://www.openmodelica.org or
 * https://github.com/OpenModelica/ or
 * http://www.ida.liu.se/projects/OpenModelica,
 * and in the OpenModelica distribution.
 *
 * GNU AGPL version 3 is obtained from:
 * https://www.gnu.org/licenses/licenses.html#GPL
 *
 * This program is distributed WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE, EXCEPT AS EXPRESSLY SET FORTH
 * IN THE BY RECIPIENT SELECTED SUBSIDIARY LICENSE CONDITIONS OF OSMC-PL.
 *
 * See the full OSMC Public License conditions for more details.
 *
 */

import * as core from '@actions/core'

import * as installer from './installer.js'

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
    core.debug(`packagesInput ${packagesInput}`)
    if (!packagesInput) {
      packagesInput = ['omc']
    }

    const librariesInput: string[] = core.getMultilineInput('libraries')
    core.debug(`librariesInput ${librariesInput}`)

    const omcDiffInput: boolean = core.getBooleanInput('omc-diff')
    core.debug(`omcDiffInput ${omcDiffInput}`)

    // Get available OpenModelica versions
    const version = installer.getOMVersion(versionInput)
    core.debug(`Installing OpenModelica ${version.version}`)

    // Install OpenModelica
    await installer.installOM(packagesInput, version, architectureInput)

    // TODO: Cache OpenModelica

    // Test if OpenModelica programs are installed
    for (const pkg of packagesInput) {
      switch (pkg) {
        case 'omc':
          await installer.showVersion('omc')
          break
        case 'omsimulator':
          await installer.showVersion('OMSimulator')
          break
        default:
          break
      }
    }

    // Install Modelica libraries
    if (librariesInput && librariesInput.length > 0) {
      await installer.installLibs(librariesInput)
    }

    // Install omc-diff
    if (omcDiffInput) {
      await installer.installOmcDiff(true)
    }
  } catch (error) {
    core.debug('Caught error')
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
