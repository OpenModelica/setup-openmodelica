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
 * @returns The content of the ./versions.json file as object.
 */
function getOMVersionInfo(): object {
  const fileContent = fs
    .readFileSync(path.join('resources', 'versions.json'))
    .toString()
  const json = JSON.parse(fileContent)
  core.debug(json)
  return json
}

/**
 * @returns An array of all OpenModelica versions available for download / install
 */
function getOMVersions(): string[] {
  const versionInfo = getOMVersionInfo()
  const versions: string[] = []

  for (const ver in versionInfo) {
    versions.push(ver)
  }
  core.debug(`Available versions: ${versions.toString()}`)

  return versions
}

export function getOMVersion(versionInput: string): string {
  const availableReleases = getOMVersions()
  core.debug(`Available versions ${availableReleases}`)

  // Use the highest available version that matches versionInput
  const version = semver.maxSatisfying(availableReleases, versionInput)
  if (version == null) {
    throw new Error(
      `Could not find a OpenModelica version that matches ${versionInput}`
    )
  }

  return version
}

/**
 *
 * @param version       Version of OpenModelica to install
 * @param releaseType   One of 'release', 'stable' or 'nightly'
 * @param useSudo       true if root rights are required
 */
async function aptInstallOM(
  version: string,
  releaseType: string,
  useSudo: boolean
): Promise<void> {
  const availableReleases = ['release', 'stable', 'nightly']
  if (!availableReleases.includes(releaseType)) {
    throw new Error(`Not a valid release type ${releaseType}`)
  }

  let sudo: string
  if (useSudo) {
    sudo = 'sudo'
  } else {
    sudo = ''
  }

  // Rmove old previous openmodelica.list
  await exec.exec(
    `/bin/bash -c "sudo rm -f /etc/apt/sources.list.d/openmodelica.list /usr/share/keyrings/openmodelica-keyring.gpg"`
  )

  // Add OpenModelica PGP public key
  await exec.exec(
    `/bin/bash -c "curl -fsSL http://build.openmodelica.org/apt/openmodelica.asc ${'|'} ${sudo} gpg --dearmor -o /usr/share/keyrings/openmodelica-keyring.gpg"`
  )

  await exec.exec(
    `/bin/bash -c "echo deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/openmodelica-keyring.gpg] https://build.openmodelica.org/apt ${'`'}lsb_release -cs${'`'} ${releaseType} ${'|'} ${sudo} tee /etc/apt/sources.list.d/openmodelica.list"`
  )

  // Install OpenModelica
  await exec.exec(`${sudo} apt update`)
  await exec.exec(`${sudo} apt install omc=${version}-1 -V -qy`)
}

/**
 * Install OpenModelica
 *
 * @param version   Version of OpenModelcia to be installed
 */
export async function installOM(version: string): Promise<void> {
  switch (osPlat) {
    case 'linux':
      await aptInstallOM(version, 'release', true)
      break
    default:
      throw new Error(`Platform ${osPlat} is not supported`)
  }
}

/**
 * Test if omc has been installed and print the version.
 */
export async function showVersion(): Promise<void> {
  const exitCode = await exec.exec('omc', ['--version'])

  if (exitCode !== 0) {
    throw new Error(
      `OpenModelica could not be installed properly. Exit code: ${exitCode}`
    )
  }
}
