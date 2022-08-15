import * as cache from '@actions/cache'
import * as core from '@actions/core'

import * as fs from 'fs'
import * as https from 'https'
import * as path from 'path'

/**
 * Taken from https://gist.github.com/gkhays/fa9d112a3f9ee61c6005136ebda2a6fd
 *
 * @param file    Downloading file.
 * @param cur     Already downloaded bytes.
 * @param len     Total size of file in bytes.
 * @param total   Total size of file in megabytes.
 */
function showProgress(
  file: string,
  cur: number,
  len: number,
  total: number
): void {
  core.debug(
    `Downloading ${file} - ${((100.0 * cur) / len).toFixed(2)}% (${(
      cur / 1048576
    ).toFixed(2)} MB) of total size: ${total.toFixed(2)} MB`
  )
}

/**
 * Taken from https://usefulangle.com/post/170/nodejs-synchronous-http-request
 *
 * @param url   HTTPS url to file to download.
 * @param dest  Destination directory for download.
 * @returns     Promise for downloading.
 */
async function getDownloadPromise(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https.get(url, response => {
      const header = response.headers['content-length']
      const len = header ? parseInt(header, 10) : 0
      const total = len / 1048576 //1048576 - bytes in 1 Megabyte
      const wait = 1000 // wait in milliseconds
      let cur = 0
      let lastTime = 0

      if (response.statusCode === 200) {
        response.pipe(file)
      } else {
        file.close()
        fs.unlink(dest, () => {}) // Delete temp file
        reject(
          Error(
            `Server responded with ${response.statusCode}: ${response.statusMessage}`
          )
        )
      }

      response.on('data', function (chunk) {
        cur += chunk.length
        if (Date.now() - lastTime >= wait) {
          showProgress(dest, cur, len, total)
          lastTime = Date.now()
        }
      })

      response.on('error', err => {
        file.close()
        fs.unlink(dest, () => {}) // Delete temp file
        reject(err.message)
      })

      file.on('finish', () => {
        resolve()
      })

      file.on('error', err => {
        file.close()
        fs.unlink(dest, () => {}) // Delete temp file
        reject(err.message)
      })
    })
  })
}

/**
 * @param url   Download URL.
 * @param dest  Destination directory to download to.
 */
export async function downloadSync(url: string, dest: string): Promise<void> {
  fs.mkdirSync(path.dirname(dest), {recursive: true})
  await getDownloadPromise(url, dest)
}

/**
 * Download file or return cached file.
 * Doesn't use cached installer if url ends with `-latest.exe` or
 * ignoreCached is true.
 *
 * @param url           HTTPS url to file to download.
 * @param dest          Destination directory for download.
 * @param ignoreCached  Ignore cached installer when true.
 */
export async function downloadCachedSync(
  url: string,
  dest: string,
  ignoreCached?: boolean
): Promise<string> {
  // Get name of installer from url
  const installer = url.split('/').pop()
  if (installer === undefined) {
    throw new Error(`Couldn't find installer name in url`)
  }
  const installPath = path.join(dest, installer)

  // Don't cache nightly builds or installers ending with -latest.exe
  if (ignoreCached || installer.endsWith('-latest.exe')) {
    await downloadSync(url, installPath)
  } else {
    const cacheKey = await cache.restoreCache([installPath], url)
    if (cacheKey === undefined) {
      await downloadSync(url, installPath)
    }
    const cachedId = await cache.saveCache([installPath], url)
    if (cachedId !== -1) {
      core.debug(`Installer ${installer} saved with key: ${installPath}`)
    }
  }

  if (!fs.lstatSync(installPath).isFile()) {
    throw new Error(`Couldn't find installer executable in ${installPath}`)
  }

  return installPath
}
