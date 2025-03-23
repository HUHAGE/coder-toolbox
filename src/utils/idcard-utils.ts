import { regionData, isValidAreaCode, getAreaName, areaCodeMap } from './region-data'

interface IdCardOptions {
  region?: string[]
  birthday?: Date | string
  gender?: number
}

// 权重因子
const WEIGHT_FACTORS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]

// 校验码
const CHECK_CODES = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

// 生成随机数
const randomNum = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 生成随机日期
const randomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return date.toISOString().slice(0, 10).replace(/-/g, '')
}

// 计算校验码
const calculateCheckCode = (id17: string): string => {
  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(id17[i]) * WEIGHT_FACTORS[i]
  }
  return CHECK_CODES[sum % 11]
}

// 生成身份证号
export const generateIdNumber = (options: IdCardOptions = {}): string => {
  // 处理地区码
  let areaCode = ''
  if (options.region && options.region.length === 3) {
    areaCode = options.region[2] // 使用县级代码
  } else {
    // 从所有有效区域中随机选择一个
    const validAreas = getAllValidAreaCodes()
    areaCode = validAreas[Math.floor(Math.random() * validAreas.length)]
  }

  // 处理出生日期
  let birthDate = ''
  if (options.birthday) {
    const date = new Date(options.birthday)
    birthDate = date.toISOString().slice(0, 10).replace(/-/g, '')
  } else {
    // 随机生成1950-2000年之间的日期
    birthDate = randomDate(new Date(1950, 0, 1), new Date(2000, 11, 31))
  }

  // 处理顺序码（包含性别信息）
  let sequenceCode = randomNum(100, 999).toString().padStart(3, '0')
  if (options.gender) {
    // 根据性别修改顺序码的最后一位
    const lastDigit = options.gender === 1 ? randomNum(0, 4) * 2 + 1 : randomNum(0, 4) * 2
    sequenceCode = sequenceCode.slice(0, -1) + lastDigit
  }

  // 拼接前17位
  const id17 = areaCode + birthDate + sequenceCode

  // 计算并添加校验码
  return id17 + calculateCheckCode(id17)
}

// 获取所有有效的区县级地区码
const getAllValidAreaCodes = (): string[] => {
  const validCodes: string[] = []
  
  regionData.forEach(province => {
    province.children?.forEach(city => {
      city.children?.forEach(district => {
        if (district.value) {
          validCodes.push(district.value)
        }
      })
    })
  })
  
  return validCodes
}

interface ValidationResult {
  isValid: boolean
  messages: string[]
}

// 修改校验函数，返回更完整的免责声明
export const validateIdNumber = (idNumber: string) => {
  return {
    isValid: false,
    message: '免责声明：\n1. 本工具生成和显示的身份证号码均为虚拟数据，仅用于软件开发、功能测试等用途；\n2. 请勿将本工具用于生成、验证或收集真实身份证号码；\n3. 根据《中华人民共和国居民身份证法》，任何组织和个人不得非法收集、使用、传播公民的居民身份证信息。'
  }
}

// 移除不需要的辅助函数
const getAreaNameNew = (areaCode: string): string => {
  return ''  // 保留函数但返回空字符串，因为生成功能可能还会用到
}

const isValidBirthDate = (birthDate: string): boolean => {
  return true  // 保留函数但始终返回true，因为生成功能可能还会用到
}

// 解析身份证信息
const parseIdCardInfo = (idNumber: string) => {
  const birthDate = `${idNumber.substring(6, 10)}-${idNumber.substring(10, 12)}-${idNumber.substring(12, 14)}`
  const gender = parseInt(idNumber.substring(16, 17)) % 2 === 0 ? '女' : '男'
  
  return {
    area: getAreaName(idNumber.substring(0, 6)),
    birthDate,
    gender
  }
} 