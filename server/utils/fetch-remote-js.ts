import { get } from 'node:https'

export function fetchRemoteJs(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    get(url, (res) => {
      let data = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => resolve(data)).on('error', (err) => reject(err))
    })
  })
}
