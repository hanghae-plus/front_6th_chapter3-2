import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useEventOperations } from '../../hooks/useEventOperations';
import type { Event } from '../../types';

// Mock useSnackbar
const mockEnqueueSnackbar = vi.fn();
vi.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueueSnackbar,
  }),
}));

describe('useEventOperations - 반복 일정 저장', () => {
  const mockEvent: Event = {
    id: '1',
    title: '반복 회의',
    date: '2024-03-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '테스트 설명',
    location: '회의실',
    category: '업무',
    notificationTime: 10,
    repeat: {
      type: 'daily',
      interval: 1,
      endDate: '2024-03-20',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('반복 일정 저장 시 개별 이벤트로 변환하여 저장해야 함', async () => {
    // Mock fetch responses
    vi.mocked(fetch).mockImplementation(() => {
      if (vi.mocked(fetch).mock.calls.length === 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ events: [] }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);
    });

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.saveEvent(mockEvent);
    });

    // 서버에 POST 요청이 여러 번 발생했는지 확인
    const postCalls = vi
      .mocked(fetch)
      .mock.calls.filter(([, options]) => options?.method === 'POST');
    expect(postCalls.length).toBeGreaterThan(1);

    // 각 요청이 올바른 데이터를 포함하고 있는지 확인
    postCalls.forEach(([, options]) => {
      const eventData = JSON.parse(options!.body as string);
      expect(eventData).toHaveProperty('title', '반복 회의');
      expect(eventData).toHaveProperty('repeat');
      expect(eventData.id).toBeDefined();
    });

    // 성공 메시지가 표시되었는지 확인
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('반복 일정이 성공적으로 생성되었습니다.', {
      variant: 'success',
    });
  });

  it('반복 일정 저장 실패 시 에러 메시지를 표시해야 함', async () => {
    // Mock fetch for failed event creation
    vi.mocked(fetch).mockImplementation(() => {
      if (vi.mocked(fetch).mock.calls.length === 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ events: [] }),
        } as Response);
      }
      return Promise.resolve({
        ok: false,
        statusText: 'Server Error',
      } as Response);
    });

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.saveEvent(mockEvent);
    });

    // 에러 메시지가 표시되었는지 확인
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('일정 저장 실패', {
      variant: 'error',
    });
  });

  it('반복 일정 저장 후 UI가 업데이트되어야 함', async () => {
    const mockEvents = [
      { ...mockEvent, id: '1', date: '2024-03-15' },
      { ...mockEvent, id: '2', date: '2024-03-16' },
      { ...mockEvent, id: '3', date: '2024-03-17' },
    ];

    // Mock fetch responses
    let fetchCount = 0;
    vi.mocked(fetch).mockImplementation(() => {
      fetchCount++;
      if (fetchCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ events: [] }),
        } as Response);
      }
      if (fetchCount > mockEvents.length + 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ events: mockEvents }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);
    });

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.saveEvent(mockEvent);
    });

    // UI에 반복 일정이 모두 표시되는지 확인
    expect(result.current.events).toHaveLength(3);
    expect(result.current.events[0].date).toBe('2024-03-15');
    expect(result.current.events[1].date).toBe('2024-03-16');
    expect(result.current.events[2].date).toBe('2024-03-17');
  });
});
