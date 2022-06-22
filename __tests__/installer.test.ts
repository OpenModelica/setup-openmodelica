import * as installer from '../src/installer'
import {expect, test} from '@jest/globals'

test('Get OM version', async() => {
  const version = installer.getOMVersion('1.19')

  expect(version).toEqual('1.19.0')
})

test('Install OpenModelica 1.19.0', async () => {
  await installer.installOM('1.19.0')
}, 10*60000)

test('Test OM installation', async() => {
  await installer.showVersion()
})
