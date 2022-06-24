import * as installer from '../src/installer'
import {expect, test} from '@jest/globals'

test('Get Linux versions', async () => {
  const releaseVersions = installer.getLinuxOMVersions()
})

test('Get some versions', async () => {
  let outVer: string
  outVer = installer.getOMVersion('1.19')
  expect(outVer).toEqual('1.19.0')

  outVer = installer.getOMVersion('1')
  expect(outVer).toEqual('1.19.0')

  outVer = installer.getOMVersion('1.19.0')
  expect(outVer).toEqual('1.19.0')
})

test(
  'Install 64 bit OpenModelica release 1.19.0',
  async () => {
    const version = installer.getOMVersion('1.19')
    await installer.installOM(version, 'release', '64')
    await installer.showVersion()
  },
  10 * 60000
)
