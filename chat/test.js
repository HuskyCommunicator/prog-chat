/**
 * 计算分页的偏移量和限制
 * @param {number} pageNo - 当前页码，默认为1
 * @param {number} totalCount - 总记录数
 * @returns {object} 包含总页数、偏移量和每页记录数的对象
 */
const getPageOffset = (pageNo = 2, totalCount) => {
  // 每页显示的记录数
  const pageSize = 2

  // 计算总页数
  // 如果总记录数能被pageSize整除，则总页数为totalCount / pageSize
  // 否则，总页数为totalCount / pageSize的整数部分加1
  const pageTotal = totalCount % pageSize == 0 ? totalCount / pageSize : Math.floor(totalCount / pageSize) + 1

  //页码是指分页系统中的当前页数
  // 确保页码不小于1
  pageNo = pageNo <= 1 ? 1 : pageNo

  // 确保页码不大于总页数
  pageNo = pageNo > pageTotal ? pageTotal : pageNo

  // 返回包含总页数、偏移量和每页记录数的对象
  return {
    pageTotal, // 总页数
    offset: (pageNo - 1) * pageSize, // 偏移量指从数据集的起始位置开始，跳过的记录数，计算公式为(当前页码 - 1) * 每页记录数
    limit: pageSize // 每页记录数
  }
}

// 示例调用
const result = getPageOffset(1, 9)
console.log(result) // 输出 { pageTotal: 3, offset: 0, limit: 4 }
