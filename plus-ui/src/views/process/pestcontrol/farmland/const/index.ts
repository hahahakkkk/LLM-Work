// 病害等级枚举
export enum DiseaseSeverity {
  LOW = '轻度',
  MEDIUM = '中度',
  HIGH = '重度'
}

export const DiseaseSeverityMap: Record<DiseaseSeverity, { label: string; btnType: 'success' | 'warning' | 'danger' }> = {
  [DiseaseSeverity.LOW]: { label: DiseaseSeverity.LOW, btnType: 'success' },
  [DiseaseSeverity.MEDIUM]: { label: DiseaseSeverity.MEDIUM, btnType: 'warning' },
  [DiseaseSeverity.HIGH]: { label: DiseaseSeverity.HIGH, btnType: 'danger' }
};
