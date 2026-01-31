import { DiseaseSeverity } from '../const';

export const useDiseaseState = (diseaseRate: number) => {
  if (diseaseRate <= 5) {
    return DiseaseSeverity.LOW;
  } else if (diseaseRate <= 25) {
    return DiseaseSeverity.MEDIUM;
  } else {
    return DiseaseSeverity.HIGH;
  }
};
