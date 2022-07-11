import * as core from '@actions/core'
import * as exec from '@actions/exec'

import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import * as semver from 'semver'

// Store information about the environment
const osPlat = os.platform() // possible values: win32 (Windows), linux (Linux), darwin (macOS)
core.debug(`platform: ${osPlat}`)

/**
 * @returns An array of all OpenModelica versions available for download / install
 */
export function getLinuxOMVersions(): string[] {
  // parse versions.json
  const resourcesDir = path.join(__dirname, '../resources')
  const fileContent = fs
    .readFileSync(path.join(resourcesDir, 'versions.json'))
    .toString()
  const json = JSON.parse(fileContent)
  core.debug(json)

  // Get versions
  const versions = json.linux.releaseVersions
  core.debug(`Available versions: ${versions.toString()}`)
  return versions
}

export function getOMVersion(versionInput: string): string {
  let version: string
  if (osPlat === 'linux') {
    const availableReleases = getLinuxOMVersions()
    core.debug(`Available versions ${availableReleases}`)

    // Use the highest available version that matches versionInput
    const maxVersion = semver.maxSatisfying(availableReleases, versionInput)
    if (maxVersion == null) {
      throw new Error(
        `Could not find a OpenModelica version that matches ${versionInput}`
      )
    }
    version = maxVersion
  } else {
    version = versionInput
  }

  return version
}

/**
 * Install omc with apt.
 *
 * @param version       Version of OpenModelica to install
 * @param releaseType   One of 'release', 'stable' or 'nightly'
 * @param bit           String specifying 32 or 64 bit version.
 * @param useSudo       true if root rights are required
 */
async function aptInstallOM(
  version: string,
  releaseType: string,
  bit: string,
  useSudo: boolean
): Promise<void> {
  let sudo: string
  if (useSudo) {
    sudo = 'sudo'
  } else {
    sudo = ''
  }

  // Get architecture
  const out = await exec.getExecOutput(
    `/bin/bash -c "dpkg --print-architecture"`
  )
  let arch = out.stdout.trim()
  switch (arch) {
    case 'amd64':
      if (bit === '32') arch = 'i386'
      break
    case 'arm64':
      if (bit === '32') arch = 'armhf'
      break
    case 'armhf':
      if (bit === '64')
        throw new Error(`Architecture is "armhf", 64bit not supported.`)
      break
    case 'i386':
      if (bit === '64')
        throw new Error(`Architecture is "i386", 64bit not supported.`)
      break
    default:
      throw new Error(`Unknown architecture ${arch}.`)
  }

  // Rmove old previous openmodelica.list
  await exec.exec(
    `/bin/bash -c "${sudo} rm -f /etc/apt/sources.list.d/openmodelica.list /usr/share/keyrings/openmodelica-keyring.gpg"`
  )

  // Add OpenModelica PGP public key
  await exec.exec(
    `/bin/bash -c "curl -fsSL http://build.openmodelica.org/apt/openmodelica.asc ${'|'} ${sudo} gpg --dearmor -o /usr/share/keyrings/openmodelica-keyring.gpg"`
  )

  if (releaseType === 'release') {
    await exec.exec(
      `/bin/bash -c "echo deb [arch=${arch} signed-by=/usr/share/keyrings/openmodelica-keyring.gpg] https://build.openmodelica.org/omc/builds/linux/releases/${version}/ ${'`'}lsb_release -cs${'`'} release ${'|'} ${sudo} tee /etc/apt/sources.list.d/openmodelica.list"`
    )
  } else {
    await exec.exec(
      `/bin/bash -c "echo deb [arch=${arch} signed-by=/usr/share/keyrings/openmodelica-keyring.gpg] https://build.openmodelica.org/apt ${'`'}lsb_release -cs${'`'} ${releaseType} ${'|'} ${sudo} tee /etc/apt/sources.list.d/openmodelica.list"`
    )
  }

  // Install OpenModelica
  await exec.exec(`${sudo} apt-get update`)
  if (releaseType === 'nightly') {
    await exec.exec(`/bin/bash -c "${sudo} apt-get install omc -qy"`)
  } else {
    await exec.exec(
      `/bin/bash -c "${sudo} apt-get install omc=${version}-1 -V -qy"`
    )
  }
}

/**
 * Install OpenModelica
 *
 * @param version             Version of OpenModelcia to be installed.
 * @param releaseType         Release, stable release or nightly build.
 * @param architectureInput   64 or 32 bit.
 */
export async function installOM(
  version: string,
  releaseType: string,
  architectureInput: string
): Promise<void> {
  switch (osPlat) {
    case 'linux':
      await aptInstallOM(version, releaseType, architectureInput, true)
      break
    default:
      throw new Error(`Platform ${osPlat} is not supported`)
  }
}

/**
 * Test if omc has been installed and print the version.
 */
export async function showVersion(): Promise<string> {
  const out = await exec.getExecOutput('omc', ['--version'])

  if (out.exitCode !== 0) {
    core.debug(`Error message: ${out.stderr}`)
    throw new Error(
      `OpenModelica could not be installed properly. Exit code: ${out.exitCode}`
    )
  }

  const version = out.stdout.trim().split(' ')[1]
  return version
}
