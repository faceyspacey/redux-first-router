// @flow
import qs from 'qs'

export default (search: string) => qs.parse(search, { decoder })

const decoder = (
  str: string,
  decode: Function
): number => isNumber(str) ? parseFloat(str) : decode(str)

const isNumber = (str: string): boolean => !isNaN(str) && !isNaN(parseFloat(str))
