import * as core from '@actions/core'
import * as exec from '@actions/exec'

import {cwd} from 'process'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import * as semver from 'semver'
import * as util from './util'
import json from './versions.json'

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
    case 'darwin':
      osVersionLst = json.mac
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
  if (osPlat !== 'linux' && osPlat !== 'win32' && osPlat !== 'darwin') {
    throw new Error(`getOMVersion: OS ${osPlat} not supported.`)
  }

  let maxVersion: string | null

  if (
    versionInput === 'nightly' ||
    versionInput === 'stable' ||
    versionInput === 'release'
  ) {
    maxVersion = versionInput
  } else if (versionInput.includes('dev')) {
    maxVersion = versionInput
  } else {
    // Use the highest available version that matches versionInput
    const availableReleases = getOMVersions()
    maxVersion = semver.maxSatisfying(availableReleases, versionInput)
    if (maxVersion == null) {
      // Check pre-releases
      core.debug(`Checking pre releases`)
      // Workaround so that 20 is smaller than 100. Add leading zeroes
      for (let i=0; i<availableReleases.length; i++) {
        if (availableReleases[i].includes('-dev-')) {
          const splittedArray = availableReleases[i].split('-dev-')
          core.debug(`Splitted array of ${availableReleases[i].toString()}: ${splittedArray.toString()}`)
          if (Number(splittedArray[1]) < 100) {
            core.debug(`Smaller 100`)
            availableReleases[i] = `${splittedArray[0]}-dev-00${splittedArray[1]}`
          } else if (Number(splittedArray[1]) < 1000) {
            core.debug(`Smaller 1000`)
            availableReleases[i] = `${splittedArray[0]}-dev-0${splittedArray[1]}`
          }
        }
      }
      core.debug(`Available versions: ${availableReleases.toString()}`)

      maxVersion = semver.maxSatisfying(availableReleases, `>${versionInput}-dev`, { includePrerelease: true })
      if (maxVersion == null) {
        throw new Error(
          `Could not find a OpenModelica version that matches ${versionInput}`
        )
      } else {
        // Remove leading zeroes
        const splittedArray = maxVersion.split('-dev-')
        maxVersion = `${splittedArray[0]}-dev-${Number(splittedArray[1])}`
      }
    }
  }
  core.debug(`Searching for ${versionInput}, found max version: ${maxVersion}`)

  // Return highest version from versions.json
  let osVersionLst: VersionType[] = []
  switch (osPlat) {
    case 'linux':
      osVersionLst = json.linux
      break
    case 'win32':
      osVersionLst = json.windows
      break
    case 'darwin':
      osVersionLst = json.mac
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
 * Install OpenModelica packages with apt.
 *
 * @param packages      APT packages to install.
 * @param version       Version object to install.
 * @param bit           String specifying 32 or 64 bit version.
 * @param useSudo       true if root rights are required.
 */
async function aptInstallOM(
  packages: string[],
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
  let out = await exec.getExecOutput(`/bin/bash -c "dpkg --print-architecture"`)
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

  // Check if distribution is available
  out = await exec.getExecOutput(`/bin/bash -c "lsb_release -cs"`)
  const distro = out.stdout.trim()
  if (
    version.version !== 'nightly' &&
    version.version !== 'stable' &&
    version.version !== 'release'
  ) {
    const response = await fetch(`${version.address}dists/${distro}`)
    if (response.status === 404) {
      throw new Error(
        `Distribution ${distro} not available for OpenModelica version ${version.version}.`
      )
    }
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
    ${version.address} ${distro} ${version.type} \
    ${'|'} ${sudo} tee /etc/apt/sources.list.d/openmodelica.list"`
  )

  // Install OpenModelica packages
  core.info(`Running apt-get install`)
  await exec.exec(`${sudo} apt-get clean`)
  await exec.exec(`${sudo} apt-get update`)
  for (const pkg of packages) {
    if (version.type === 'nightly' || !version.aptname) {
      core.debug(`Running: /bin/bash -c "${sudo} apt-get install ${pkg} -qy"`)
      await exec.exec(`/bin/bash -c "${sudo} apt-get install ${pkg} -qy"`)
    } else {
      core.debug(
        `/bin/bash -c "${sudo} apt-get install ${pkg}=${version.aptname} -V -qy`
      )
      await exec.exec(
        `/bin/bash -c "${sudo} apt-get install ${pkg}=${version.aptname} -V -qy"`
      )
    }
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
  const installer = await util.downloadCachedSync(
    version.address,
    'tmp',
    version.version === 'nightly'
  )

  if (bit !== version.arch) {
    throw new Error(`Architecture doesn't match architecture of version.`)
  }

  // Run installer
  core.info(`Running installer ${installer}`)
  await exec.exec(`${installer} /S /v /qn`)

  // Add OpenModelica to PATH and set OPENMODELICAHOME
  const openmodelicahome = fs
    .readdirSync('C:\\Program Files\\')
    .filter(function (file) {
      return (
        fs.lstatSync(path.join('C:\\Program Files\\', file)).isDirectory() &&
        file.startsWith('OpenModelica')
      )
    })
  const pathToOmc = path.join('C:\\Program Files\\', openmodelicahome[0], 'bin')
  core.info(`Adding ${pathToOmc} to PATH`)
  core.addPath(pathToOmc)
  core.exportVariable(
    'OPENMODELICAHOME',
    path.join('C:\\Program Files\\', openmodelicahome[0])
  )

  // Clean up
  fs.rmSync('tmp', {recursive: true})
}

/**
 * Install omc using the Windows installer executable.
 *
 * @param version       Version object to install.
 */
async function macInstallOM(version: VersionType): Promise<void> {

  // Download OpenModelica pkg file tmp/
  const pkg = await util.downloadCachedSync(
    version.address,
    'tmp',
    version.version === 'nightly'
  )

  // Run installer
  core.info(`Running installer with package ${pkg}`)
  await exec.exec(`installer -pkg ${pkg} -target CurrentUserHomeDirectory`)

  // Clean up
  fs.rmSync('tmp', {recursive: true})
}

/**
 * Install OpenModelica packages (omc, OMSimulator)
 *
 * @param packages            (APT) packages to install.
 * @param version             Version of OpenModelica to be installed.
 * @param architectureInput   64 or 32 bit.
 */
export async function installOM(
  packages: string[],
  version: VersionType,
  architectureInput: string
): Promise<void> {
  switch (osPlat) {
    case 'linux':
      await aptInstallOM(packages, version, architectureInput, true)
      break
    case 'win32':
      await winInstallOM(version, architectureInput)
      break
    case 'darwin':
      await macInstallOM(version)
      break
    default:
      throw new Error(`Platform ${osPlat} is not supported`)
  }
}

/**
 * Test if program has been installed and print the version.
 */
export async function showVersion(program: string): Promise<string> {
  const out = await exec.getExecOutput(program, ['--version'])

  if (out.exitCode !== 0) {
    core.debug(`Error message: ${out.stderr}`)
    core.setFailed(
      Error(
        `${program} could not be installed properly. Exit code: ${out.exitCode}`
      )
    )
  }

  const version = out.stdout.trim().split(' ')[1]
  return version
}

/**
 * Install Modelica libraries with the OpenModelica package manager
 *
 * @param librariesInput  List of Modelica libraries with versions
 */
export async function installLibs(librariesInput: string[]): Promise<void> {
  const filename = genInstallScript(librariesInput)

  // Run install script
  core.info(`Running install script ${filename}`)
  await exec.exec(`omc ${filename}`)

  // Clean up
  fs.rmSync(filename)
}

/**
 * Write install script for Modelica libraries
 * @param librariesInput
 */
function genInstallScript(librariesInput: string[]): string {
  const filename = path.join(cwd(), 'installLibs.mos')

  const installPackages: string[] = []
  for (const library of librariesInput) {
    const matches = library.match(/\s*\b(\w+)\b\s*(.*)\b/)
    if (!matches) {
      throw new Error(`Invalid library name ${library}`)
    }
    const name = matches[1]
    const version = matches[2]
    installPackages.push(`if not installPackage(${name}, "${version}", exactMatch=true) then
  print("Failed to install ${library}");
  print(getErrorString());
  exit(1);
else
  print("Installed: ${library}\\n");
end if;\n`)
  }
  const content = `updatePackageIndex(); getErrorString();
${installPackages.join('\n')}`

  // Write file
  core.debug(`Writing ${filename}`)
  fs.writeFile(filename, content, function (err) {
    if (err) {
      core.setFailed(Error(`Failed to write install script ${filename}.`))
    }
  })

  return filename
}

/**
 * Install OpenModelica omc-diff program.
 *
 * @param useSudo       true if root rights are required.
 */
export async function installOmcDiff(useSudo: boolean): Promise<void> {
  switch (osPlat) {
    case 'linux':
      break
    case 'win32':
      core.info(`Windows version of OpenModelica already installs omc-diff.`)
      return
    default:
      throw new Error(
        `omc-diff not available for platform ${osPlat}. Open a feature request on https://github.com/AnHeuermann/omc-diff.`
      )
  }

  const sudo: string = useSudo ? 'sudo' : ''

  // Download executable from https://github.com/AnHeuermann/omc-diff/
  const url =
    'https://github.com/AnHeuermann/omc-diff/releases/download/v0.1/linux-64.tar.gz'
  const file = url.split('/').pop()
  if (file === undefined) {
    throw new Error(`Something wrong with the url`)
  }
  await exec.exec(`wget ${url}`)

  // Extract .tar.gz
  await exec.exec(`${sudo} tar -xvf ${file} -C /usr/bin/`)

  // Clean up
  fs.rmSync(file)
}
