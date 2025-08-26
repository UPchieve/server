import { parse } from 'file-type-mime'

export function getImageFileType(image: Buffer) {
  return parse(new Uint8Array(image).buffer)
}
