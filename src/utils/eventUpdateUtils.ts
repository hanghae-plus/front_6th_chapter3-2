import { Event, RepeatInfo } from '../types';

/**
 * 이벤트의 반복 설정을 업데이트하는 함수
 * @param event - 업데이트할 이벤트
 * @param newRepeat - 새로운 반복 설정
 * @returns 업데이트된 이벤트 (원본 객체는 변경하지 않음)
 */
export const updateEventRepeat = (event: Event, newRepeat: RepeatInfo): Event => {
  return {
    ...event,
    repeat: newRepeat,
  };
};
