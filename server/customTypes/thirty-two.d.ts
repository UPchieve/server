declare module 'thirty-two' {
  export function encode(input: Buffer | string): Buffer
  export function decode(input: string): Buffer
}
