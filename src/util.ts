import * as core from '@actions/core'

import * as fs from 'fs'
import * as https from 'https'
import * as path from 'path'

/**
 * Taken from https://gist.github.com/gkhays/fa9d112a3f9ee61c6005136ebda2a6fd
 * @param file 
 * @param cur 
 * @param len 
 * @param total 
 */
 function showProgress(file: string, cur: number, len: number, total: number): void {
  core.debug(
    `Downloading ${file} - ${(100.0 * cur / len).toFixed(2)}% (${(cur / 1048576).toFixed(2)} MB) of total size: ${total.toFixed(2)} MB`
  )
}

/**
 * Taken from https://usefulangle.com/post/170/nodejs-synchronous-http-request
 *
 * @param url 
 * @param dest 
 * @returns 
 */
function getPromise(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    const request = https.get(url, (response) => {
      let header = response.headers['content-length']
      let len = header ? parseInt(header, 10) : 0
      let cur = 0;
      let total = len / 1048576 //1048576 - bytes in 1 Megabyte
      let wait = 1000 // wait in milliseconds
      let lastTime: number = 0

      if (response.statusCode === 200) {
        response.pipe(file)
      } else {
        file.close()
        fs.unlink(dest, () => { })   // Delete temp file
        reject(`Server responded with ${response.statusCode}: ${response.statusMessage}`)
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
        fs.unlink(dest, () => { }) // Delete temp file
        reject(err.message)
      })

      file.on("finish", () => {
        resolve()
      })

      file.on("error", err => {
        file.close()
        fs.unlink(dest, () => { }) // Delete temp file
        reject(err.message)
      })
    })
  })
}


/**
 * @param url   Download URL.
 * @param dest  Destination to download to.
 */
export async function downloadSync(url: string, dest: string): Promise<void> {
  try {
    fs.mkdirSync(path.dirname(dest), {recursive: true})
    let downloadCall = getPromise(url, dest)
    await downloadCall;
  } catch (error) {
    console.log(error);
  }
}
