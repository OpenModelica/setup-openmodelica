import * as installer from '../src/installer'
import * as core from '@actions/core'
import * as exec from '@actions/exec'

import * as fs from 'fs'
import {expect, test} from '@jest/globals'

async function purgeOMC(): Promise<void> {
  const fileContent = fs.readFileSync('/var/log/apt/history.log').toString()
  const matches = fileContent.match('Install: .*omc.*')
  if (matches != null && matches.length > 0) {
    const toRemove = matches[matches.length-1].replace('Install: ','').replace(/:[^\)]*\),*/g, '')
    console.log(`Files to remove: ${toRemove}`)
    await exec.exec(`/bin/bash -c "sudo apt-get purge ${toRemove} -qy ${'||'} sudo apt-get autoremove -qy"`)
  }
}

test('Get Linux versions', async () => {
  const releaseVersions = installer.getLinuxOMVersions()
})

test('Get some versions', async () => {
  let outVer: string
  outVer = installer.getOMVersion('1.19')
  expect(outVer).toEqual('1.19.2')

  outVer = installer.getOMVersion('1')
  expect(outVer).toEqual('1.19.2')

  outVer = installer.getOMVersion('1.19.2')
  expect(outVer).toEqual('1.19.2')

  outVer = installer.getOMVersion('1.18.0')
  expect(outVer).toEqual('1.18.0')
})

test(
  'Install 64 bit OpenModelica release 1.19',
  async () => {
    await purgeOMC()
    const version = installer.getOMVersion('1.19')
    await installer.installOM(version, 'stable', '64')
    const resVer = await installer.showVersion()
    expect(resVer).toEqual('1.19.2')
  },
  10 * 60000
)

test(
  'Install 64 bit OpenModelica release 1.18.0',
  async () => {
    await purgeOMC()
    const version = installer.getOMVersion('1.18.0')
    await installer.installOM(version, 'release', '64')
    const resVer = await installer.showVersion()
    expect(resVer).toEqual('1.18.0')
  },
  10 * 60000
)

test(
  'Install 64 bit OpenModelica nigthly',
  async () => {
    await purgeOMC()
    await installer.installOM('', 'nightly', '64')
    const resVer = await installer.showVersion()
    expect(resVer).toContain('1.20.0~dev-')
  },
  10 * 60000
)
