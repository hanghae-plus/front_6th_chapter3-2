import type { Event } from '../types';
import { normalizeEvents } from './eventMigrations';
import { generateEventInstances } from './repeatingEventUtils';

const STORAGE_KEY = 'events';

/**
 * 이벤트 목록을 로드하는 함수
 */
export async function loadEvents(): Promise<Event[]> {
  try {
    const storedEvents = localStorage.getItem(STORAGE_KEY);
    if (!storedEvents) {
      return [];
    }
    const parsed: Event[] = JSON.parse(storedEvents);
    // 수신 즉시 정규화(마이그레이션 흡수)
    return normalizeEvents(parsed);
  } catch (error) {
    console.error('Failed to load events:', error);
    return [];
  }
}

/**
 * 이벤트 목록을 저장하는 함수
 * @param events 저장할 이벤트 목록
 * @returns 저장 성공 여부
 */
export async function saveEvents(events: Event[]): Promise<boolean> {
  try {
    // 기존 이벤트 로드
    const existingEvents = await loadEvents();

    // 새 이벤트들을 반복 일정으로 확장
    const expandedEvents = events.flatMap((event) => {
      if (event.repeat.type === 'none') {
        return [event];
      }
      return generateEventInstances(event.repeat, event);
    });

    // 기존 이벤트와 새 이벤트 병합
    // 저장 전 최종 정규화
    const allEvents = normalizeEvents([...existingEvents, ...expandedEvents]);

    // 저장
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allEvents));
    return true;
  } catch (error) {
    console.error('Failed to save events:', error);
    return false;
  }
}

/**
 * 성공 메시지를 표시하는 함수
 * @param message 표시할 메시지
 */
export function showSuccessMessage(message: string): void {
  // 실제 UI 컴포넌트에서 구현될 예정
  console.log('Success:', message);
}
