export interface TimeValidationResult {
  startTimeError: string | null;
  endTimeError: string | null;
}

export function getTimeErrorMessage(start: string, end: string): TimeValidationResult {
  if (!start || !end) return emptyErrors();
  const startDate = toSameDayDate(start);
  const endDate = toSameDayDate(end);
  if (startDate >= endDate) return makeErrors();
  return emptyErrors();
}

function toSameDayDate(hhmm: string): Date {
  return new Date(`2000-01-01T${hhmm}`);
}

function emptyErrors(): TimeValidationResult {
  return { startTimeError: null, endTimeError: null };
}

function makeErrors(): TimeValidationResult {
  return {
    startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
    endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
  };
}
