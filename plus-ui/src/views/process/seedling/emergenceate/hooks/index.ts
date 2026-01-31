import { EmergenceStatus } from '../const';

export const useEmergenceState = (emergenceRate: number) => {
  if (emergenceRate > 80) {
    return EmergenceStatus.NORMAL;
  } else if (emergenceRate >= 65) {
    return EmergenceStatus.SLIGHT_DEFICIENCY;
  } else if (emergenceRate >= 50) {
    return EmergenceStatus.MODERATE_DEFICIENCY;
  } else {
    return EmergenceStatus.SEVERE_DEFICIENCY;
  }
};
