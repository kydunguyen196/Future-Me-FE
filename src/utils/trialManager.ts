const TRIAL_STORAGE_KEY = 'sat-test-trials';
const MAX_FREE_TRIALS = 5;

export interface TrialData {
  remainingTrials: number;
  lastTrialDate: string;
  totalTrialsUsed: number;
}

export const getTrialData = (): TrialData => {
  try {
    const stored = localStorage.getItem(TRIAL_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        remainingTrials: data.remainingTrials ?? MAX_FREE_TRIALS,
        lastTrialDate: data.lastTrialDate ?? new Date().toISOString(),
        totalTrialsUsed: data.totalTrialsUsed ?? 0,
      };
    }
  } catch (error) {
    console.warn('Failed to get trial data:', error);
  }
  
  return {
    remainingTrials: MAX_FREE_TRIALS,
    lastTrialDate: new Date().toISOString(),
    totalTrialsUsed: 0,
  };
};

export const saveTrialData = (data: TrialData): void => {
  try {
    localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save trial data:', error);
  }
};

export const useTrial = (): TrialData => {
  const currentData = getTrialData();
  const newData: TrialData = {
    remainingTrials: Math.max(0, currentData.remainingTrials - 1),
    lastTrialDate: new Date().toISOString(),
    totalTrialsUsed: currentData.totalTrialsUsed + 1,
  };
  
  saveTrialData(newData);
  return newData;
};

export const hasTrialsRemaining = (): boolean => {
  const data = getTrialData();
  return data.remainingTrials > 0;
};

export const resetTrials = (): void => {
  const data: TrialData = {
    remainingTrials: MAX_FREE_TRIALS,
    lastTrialDate: new Date().toISOString(),
    totalTrialsUsed: 0,
  };
  saveTrialData(data);
};

export const markAsPaidUser = (): void => {
  try {
    localStorage.setItem('sat-paid-user', 'true');
  } catch (error) {
    console.warn('Failed to mark as paid user:', error);
  }
};

export const isPaidUser = (): boolean => {
  try {
    return localStorage.getItem('sat-paid-user') === 'true';
  } catch (error) {
    console.warn('Failed to check paid status:', error);
    return false;
  }
};

export const getRemainingTrials = (): number => {
  if (isPaidUser()) return -1;
  return getTrialData().remainingTrials;
};

export { MAX_FREE_TRIALS };