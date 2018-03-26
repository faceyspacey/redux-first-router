import qs from 'qs'

export default (search) => qs.parse(search, { decoder })

const decoder = (str, decode) => isNumber(str) ? parseFloat(str) : decode(str)

const isNumber = (str) => !isNaN(str) && !isNaN(parseFloat(str))
