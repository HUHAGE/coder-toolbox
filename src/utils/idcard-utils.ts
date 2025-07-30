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
  let sequenceCode = ''
  if (options.gender) {
    // 根据性别生成顺序码
    if (options.gender === 1) {
      // 男性：奇数
      const randomOdd = randomNum(1, 499) * 2 - 1
      sequenceCode = randomOdd.toString().padStart(3, '0')
    } else {
      // 女性：偶数
      const randomEven = randomNum(1, 499) * 2
      sequenceCode = randomEven.toString().padStart(3, '0')
    }
  } else {
    // 随机生成顺序码
    sequenceCode = randomNum(100, 999).toString().padStart(3, '0')
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
  // 基本格式检查
  if (!idNumber || typeof idNumber !== 'string') {
    return {
      isValid: false,
      message: '身份证号码不能为空'
    }
  }

  // 长度检查
  if (idNumber.length !== 18) {
    return {
      isValid: false,
      message: '身份证号码长度必须为18位'
    }
  }

  // 格式检查（前17位必须是数字，最后一位可以是数字或X）
  const pattern = /^[0-9]{17}[0-9X]$/
  if (!pattern.test(idNumber)) {
    return {
      isValid: false,
      message: '身份证号码格式不正确，前17位必须是数字，最后一位可以是数字或X'
    }
  }

  // 地区码检查
  const areaCode = idNumber.substring(0, 6)
  if (!isValidAreaCode(areaCode)) {
    return {
      isValid: false,
      message: '身份证号码中的地区码无效'
    }
  }

  // 出生日期检查
  const birthDate = idNumber.substring(6, 14)
  if (!isValidBirthDate(birthDate)) {
    return {
      isValid: false,
      message: '身份证号码中的出生日期无效'
    }
  }

  // 校验码检查
  const id17 = idNumber.substring(0, 17)
  const checkCode = idNumber.substring(17, 18)
  const calculatedCheckCode = calculateCheckCode(id17)
  
  if (checkCode !== calculatedCheckCode) {
    return {
      isValid: false,
      message: `校验码错误，期望值为 ${calculatedCheckCode}，实际值为 ${checkCode}`
    }
  }

  // 所有检查都通过
  return {
    isValid: true,
    message: '身份证号码校验通过'
  }
}

// 移除不需要的辅助函数
const getAreaNameNew = (areaCode: string): string => {
  return ''  // 保留函数但返回空字符串，因为生成功能可能还会用到
}

const isValidBirthDate = (birthDate: string): boolean => {
  if (birthDate.length !== 8) {
    return false
  }

  const year = parseInt(birthDate.substring(0, 4))
  const month = parseInt(birthDate.substring(4, 6))
  const day = parseInt(birthDate.substring(6, 8))

  // 检查年份范围（1900-当前年份）
  const currentYear = new Date().getFullYear()
  if (year < 1900 || year > currentYear) {
    return false
  }

  // 检查月份范围
  if (month < 1 || month > 12) {
    return false
  }

  // 检查日期范围
  if (day < 1 || day > 31) {
    return false
  }

  // 检查具体日期的有效性
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && 
         date.getMonth() === month - 1 && 
         date.getDate() === day
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