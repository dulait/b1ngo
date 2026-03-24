import { WinPatternType } from '../types/win-pattern-type.type';

export interface ConfigurationDto {
  matrixSize: number;
  winningPatterns: WinPatternType[];
}
