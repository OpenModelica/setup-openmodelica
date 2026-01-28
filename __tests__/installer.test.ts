import * as installer from '../src/installer'
import * as exec from '@actions/exec'

import * as fs from 'fs'
import * as os from 'os'
import { expect, test } from '@jest/globals'

const osPlat = os.platform()

switch (osPlat) {
  case 'linux':
    linuxTests()
    break
  case 'win32':
    windowsTests()
    break
  default:
    throw new Error(`Platform ${osPlat} is not supported`)
}
commonTests()

/**
 * Uninstall OpenModelica on Linux system using apt-get purge.
 */
async function purgeOMC(): Promise<void> {
  const fileContent = fs.readFileSync('/var/log/apt/history.log').toString()
  const matches = fileContent.match('Install: .*omc.*')
  if (matches != null && matches.length > 0) {
    const toRemove = matches[matches.length - 1]
      .replace('Install: ', '')
      .replace(/:[^\)]*\),*/g, '')
    console.log(`Files to remove: ${toRemove}`)
    await exec.exec(
      `/bin/bash -c "sudo apt-get purge ${toRemove} -qy ${'||'} sudo apt-get autoremove -qy"`
    )
  }
}

/**
 * Tests for Linux.
 */
function linuxTests(): void {
  test('Get Linux versions', async () => {
    const releaseVersions = installer.getOMVersions()
  })

  test('Get some versions', async () => {
    let outVer: installer.VersionType

    outVer = installer.getOMVersion('1')
    expect(outVer.version).toEqual('1.26.1')

    outVer = installer.getOMVersion('1.18')
    expect(outVer.version).toEqual('1.18.1')

    outVer = installer.getOMVersion('1.18.1')
    expect(outVer.version).toEqual('1.18.1')

    outVer = installer.getOMVersion('1.18.0')
    expect(outVer.version).toEqual('1.18.0')

    outVer = installer.getOMVersion('nightly')
    expect(outVer.type).toEqual('nightly')

    outVer = installer.getOMVersion('stable')
    expect(outVer.type).toEqual('stable')

    outVer = installer.getOMVersion('release')
    expect(outVer.type).toEqual('release')
  })

  test(
    'Install 64 bit OpenModelica release 1.26.1',
    async () => {
      await purgeOMC()
      const version = installer.getOMVersion('1.26.1')
      await installer.installOM(['omc'], version, '64')
      const resVer = await installer.showVersion('omc')
      expect(resVer).toEqual('1.26.1')
    },
    10 * 60000
  )

  test(
    'Try to install 64 bit OpenModelica release 1.22.3 which is not available on noble',
    async () => {
      await purgeOMC()
      const version = installer.getOMVersion('1.22.3')
      expect(version.version).toEqual('1.22.3')
      await expect(installer.installOM(['omc'], version, '64')).rejects.toThrow(
        'Distribution noble not available for OpenModelica version 1.22.3.'
      )
    },
    10 * 60000
  )

  test(
    'Install 64 bit OpenModelica nightly',
    async () => {
      await purgeOMC()
      const version = installer.getOMVersion('nightly')
      await installer.installOM(['omc'], version, '64')
      const resVer = await installer.showVersion('omc')
      expect(resVer).toContain('1.26.0~dev-')
    },
    10 * 60000
  )

  test(
    'Install 64 bit OpenModelica stable',
    async () => {
      await purgeOMC()
      const version = installer.getOMVersion('stable')
      await installer.installOM(['omc'], version, '64')
      const resVer = await installer.showVersion('omc')
      expect(resVer).toContain('1.25.')
    },
    10 * 60000
  )

  test(
    'Install 64 bit OpenModelica release',
    async () => {
      await purgeOMC()
      const version = installer.getOMVersion('release')
      await installer.installOM(['omc'], version, '64')
      const resVer = await installer.showVersion('omc')
      expect(resVer).toContain('1.25.')
    },
    10 * 60000
  )

  test(
    'Install 64 bit OpenModelica 1.25',
    async () => {
      await purgeOMC()
      const version = installer.getOMVersion('1.25')
      await installer.installOM(['omc'], version, '64')
      const resVer = await installer.showVersion('omc')
      expect(resVer).toContain('1.25.7')
    },
    10 * 60000
  )

  test(
    'Install OMSimulator',
    async () => {
      await purgeOMC()
      const version = installer.getOMVersion('release')
      const packages = ['omc', 'omsimulator']
      await installer.installOM(packages, version, '64')
      const resVer = await installer.showVersion('OMSimulator')
      expect(resVer).toContain('2.1.3')
    },
    10 * 60000
  )

  test(
    'Install omc-diff',
    async () => {
      await installer.installOmcDiff(true)
      const fileExists = fs.existsSync('/usr/bin/omc-diff')
      expect(fileExists).toBe(true)
    },
    10 * 60000
  )
}

/**
 * Tests for Windows.
 */
function windowsTests(): void {
  test(
    'Install 64 bit OpenModelica release 1.26.1',
    async () => {
      const version = installer.getOMVersion('1.26.1')
      expect(version.version).toEqual('1.26.1')
      await installer.installOM(['omc'], version, '64')
      const resVer = await installer.showVersion('omc')
      expect(resVer).toContain('1.26.1')
    },
    60 * 60000
  )
}

/**
 * Test for Windows and Linux.
 */
function commonTests(): void {
  test(
    'Install Modelica libraries',
    async () => {
      let output = ''
      const originalWrite = process.stdout.write

      // Redirect stdout
      process.stdout.write = ((chunk: any) => {
        output += chunk
        return true
      }) as any

      try {
        const libraries = ['Modelica 4.0.0', 'NeuralNetwork 2.1.0']
        await installer.installLibs(libraries)

        expect(output).toContain('Installed: Modelica 4.0.0')
        expect(output).toContain('Installed: NeuralNetwork 2.1.0')
      } finally {
        // Restore original stdout
        process.stdout.write = originalWrite
      }
    },
    10 * 60000
  )
}
