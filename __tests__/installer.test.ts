import * as installer from '../src/installer'
import * as exec from '@actions/exec'

import * as fs from 'fs'
import * as os from 'os'
import {expect, test} from '@jest/globals'

const osPlat = os.platform() // possible values: win32 (Windows), linux (Linux), darwin (macOS)

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

async function purgeOMC(): Promise<void> {
  const fileContent = fs.readFileSync('/var/log/apt/history.log').toString()
  const matches = fileContent.match('Install: .*omc.*')
  if (matches != null && matches.length > 0) {
    const toRemove = matches[matches.length-1].replace('Install: ','').replace(/:[^\)]*\),*/g, '')
    console.log(`Files to remove: ${toRemove}`)
    await exec.exec(`/bin/bash -c "sudo apt-get purge ${toRemove} -qy ${'||'} sudo apt-get autoremove -qy"`)
  }
}

function linuxTests(): void {
  test('Get Linux versions', async () => {
    const releaseVersions = installer.getOMVersions()
  })

  test('Get some versions', async () => {
    let outVer: installer.VersionType

    outVer = installer.getOMVersion('1')
    expect(outVer.version).toEqual('1.18.1')

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

  //test(
  //  'Install 64 bit OpenModelica release 1.19',
  //  async () => {
  //    await purgeOMC()
  //    const version = installer.getOMVersion('1.19')
  //    await installer.installOM(version, '64')
  //    const resVer = await installer.showVersion()
  //    expect(resVer).toEqual('1.19.2')
  //  },
  //  10 * 60000
  //)

  test(
    'Try to install 64 bit OpenModelica release 1.18.0 which is not availabe on jammy',
    async () => {
      await purgeOMC()
      const version = installer.getOMVersion('1.18.0')
      expect(version.version).toEqual('1.18.0')
      await expect(installer.installOM(version, '64')).rejects.toThrow('Distribution jammy not available for OpenModelica version 1.18.0.')
    },
    10 * 60000
  )

  test(
    'Install 64 bit OpenModelica nightly',
    async () => {
      await purgeOMC()
      const version = installer.getOMVersion('nightly')
      await installer.installOM(version, '64')
      const resVer = await installer.showVersion()
      expect(resVer).toContain('1.21.0~dev-')
    },
    10 * 60000
  )

  test(
    'Install 64 bit OpenModelica stable',
    async () => {
      await purgeOMC()
      const version = installer.getOMVersion('stable')
      await installer.installOM(version, '64')
      const resVer = await installer.showVersion()
      expect(resVer).toContain('1.20.')
    },
    10 * 60000
  )

  test(
    'Install 64 bit OpenModelica release',
    async () => {
      await purgeOMC()
      const version = installer.getOMVersion('release')
      await installer.installOM(version, '64')
      const resVer = await installer.showVersion()
      expect(resVer).toContain('1.19.')
    },
    10 * 60000
  )
}

function windowsTests(): void {
  test(
    'Install 64 bit OpenModelica release 1.19.2',
    async () => {
      const version = installer.getOMVersion('1.19.2')
      expect(version.version).toEqual('1.19.2')
      await installer.installOM(version, '64')
      const resVer = await installer.showVersion()
      expect(resVer).toContain('1.19.2')
    },
    10 * 60000
  )
}
