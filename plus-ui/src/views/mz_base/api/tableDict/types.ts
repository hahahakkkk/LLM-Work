export interface TableDict {
  /**
   * 标签文本
   */
  label: string;

  /**
   * 值
   */
  value: string | number;

  /**
   * 删除标记
   */
  isValid: string | number;

  /**
   * 附加数据
   */
  ext: string | number;
}
