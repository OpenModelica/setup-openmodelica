import * as core from '@actions/core'
import * as exec from '@actions/exec'

import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import * as semver from 'semver'

import json from './versions.json'
import * as util from './util'

export type VersionType = {
  version: string
  aptname?: string
  type: string
  arch?: string
  address: string
}

// Store information about the environment
const osPlat = os.platform() // possible values: win32 (Windows), linux (Linux), darwin (macOS)
core.debug(`platform: ${osPlat}`)

/**
 * @returns An array of all OpenModelica versions available for download / install
 */
export function getOMVersions(): string[] {
  // Get versions
  const versions: string[] = []

  let osVersionLst: VersionType[] = []
  switch (osPlat) {
    case 'linux':
      osVersionLst = json.linux
      break
    case 'win32':
      osVersionLst = json.windows
      break
    default:
      // Array stays empty
  }

  for (const ver of osVersionLst) {
    versions.push(ver.version)
  }

  core.debug(`Available versions: ${versions.toString()}`)
  return versions
}

/**
 * @param versionInput Version to find
 * @returns Highest available version matching versionInput.
 */
export function getOMVersion(versionInput: string): VersionType {
  if (osPlat !== 'linux' && osPlat !== 'win32') {
    throw new Error(`getOMVersion: OS ${osPlat} not supported.`)
  }

  let maxVersion: string | null

  if (
    versionInput === 'nightly' ||
    versionInput === 'stable' ||
    versionInput === 'release'
  ) {
    maxVersion = versionInput
  } else {
    // Use the highest available version that matches versionInput
    const availableReleases = getOMVersions()
    core.debug(`Available versions ${availableReleases}`)
    maxVersion = semver.maxSatisfying(availableReleases, versionInput)
    if (maxVersion == null) {
      throw new Error(
        `Could not find a OpenModelica version that matches ${versionInput}`
      )
    }
  }
  core.debug(
    `Searching for ${versionInput}, found max version: ${maxVersion}`
  )

  // Return highest version from versions.json
  let osVersionLst: VersionType[] = []
  switch (osPlat) {
    case 'linux':
      osVersionLst = json.linux
      break
    case 'win32':
      osVersionLst = json.windows
      break
    default:
      // Array stays empty
  }
  for (const ver of osVersionLst) {
    if (ver.version === maxVersion) {
      return ver
    }
  }
  throw new Error(`Could not find version ${maxVersion} in database.`)
}

/**
 * Install omc with apt.
 *
 * @param version       Version object to install.
 * @param bit           String specifying 32 or 64 bit version.
 * @param useSudo       true if root rights are required.
 */
async function aptInstallOM(
  version: VersionType,
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

  // Remove old previous openmodelica.list
  await exec.exec(
    `/bin/bash -c "${sudo} rm -f /etc/apt/sources.list.d/openmodelica.list /usr/share/keyrings/openmodelica-keyring.gpg"`
  )

  // Add OpenModelica PGP public key
  await exec.exec(
    `/bin/bash -c "curl -fsSL http://build.openmodelica.org/apt/openmodelica.asc ${'|'} ${sudo} gpg --dearmor -o /usr/share/keyrings/openmodelica-keyring.gpg"`
  )

  await exec.exec(
    `/bin/bash -c "echo deb [arch=${arch} signed-by=/usr/share/keyrings/openmodelica-keyring.gpg] \
    ${version.address} ${'`'}lsb_release -cs${'`'} ${version.type} \
    ${'|'} ${sudo} tee /etc/apt/sources.list.d/openmodelica.list"`
  )

  // Install OpenModelica
  await exec.exec(`${sudo} apt-get update`)
  if (version.type === 'nightly' || !version.aptname) {
    await exec.exec(`/bin/bash -c "${sudo} apt-get install omc -qy"`)
  } else {
    await exec.exec(
      `/bin/bash -c "${sudo} apt-get install omc=${version.aptname} -V -qy"`
    )
  }
}

/**
 * Install omc using the Windows installer executable.
 *
 * @param version       Version object to install.
 * @param bit           String specifying 32 or 64 bit version.
 */
async function winInstallOM(version: VersionType, bit: string): Promise<void> {
  // Download OpenModelica installer to tmp/
  core.debug(`Downloading installer from ${version.address}`)
  await util.downloadSync(version.address, "tmp/installer.exe")
  core.debug(`Finished download!`)

  if (bit !== version.arch) {
    throw new Error(`Architecture doesn't match architecture of version.`)
  }

  // Find installer
  let installer: string
  installer = ""
  const content = fs.readdirSync("tmp")
  for (let f of content) {
    if (f.endsWith(".exe")) {
      installer = path.resolve("tmp", f)
      break
    }
  }
  if(!fs.lstatSync(installer).isFile()) {
    throw new Error(`Couldn't find installer executable in tmp`)
  }

  // Run installer
  core.debug(`Running installer ${installer}`)
  await exec.exec(
    `${installer} /S /v /qn`
  )

  // Add OpenModelica to PATH
  const openmodelicahome = fs.readdirSync("C:\\Program Files\\").filter(function (file) {
    return fs.lstatSync(path.join("C:\\Program Files\\", file)).isDirectory() && file.startsWith("OpenModelica");
  })
  const pathToOmc = path.join("C:\\Program Files\\", openmodelicahome[0], "bin")
  core.debug(`Adding ${pathToOmc} to PATH`)
  core.addPath(pathToOmc);

  // Clean up
  fs.rmSync("tmp", { recursive:true })
}

/**
 * Install OpenModelica
 *
 * @param version             Version of OpenModelica to be installed.
 * @param architectureInput   64 or 32 bit.
 */
export async function installOM(
  version: VersionType,
  architectureInput: string
): Promise<void> {
  switch (osPlat) {
    case 'linux':
      await aptInstallOM(version, architectureInput, true)
      break
    case 'win32':
      await winInstallOM(version, architectureInput)
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
  core.info(`OpenModelica ${version}`)
  return version
}
