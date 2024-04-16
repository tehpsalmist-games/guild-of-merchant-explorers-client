export const range = (num: number) =>
  Array(num)
    .fill(0)
    .map((_, i) => i)

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))
