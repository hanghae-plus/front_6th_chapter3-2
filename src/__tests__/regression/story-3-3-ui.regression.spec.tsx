import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { setupMockHandlerBulkOperations } from '../../__mocks__/handlersUtils';
import App from '../../App';
import { server } from '../../setupTests';
import type { Event } from '../../types';
import { setup } from '../utils/setup-render';

function makeGroupEvents(groupId: string): Event[] {
  return [
    {
      id: 'd1',
      title: '반복 회의 1',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: 'desc',
      location: 'A',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2025-10-17', id: groupId },
      notificationTime: 10,
    },
    {
      id: 'd2',
      title: '반복 회의 2',
      date: '2025-10-16',
      startTime: '09:00',
      endTime: '10:00',
      description: 'desc',
      location: 'A',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2025-10-17', id: groupId },
      notificationTime: 10,
    },
  ];
}

describe('Regression - Story 3.3 UI', () => {
  it('삭제 범위가 all일 때 확인 다이얼로그에서 삭제를 누르면 그룹 전체가 삭제된다', async () => {
    setupMockHandlerBulkOperations(makeGroupEvents('repeat-del-xyz'));
    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    // 편집 모드 진입: 아무 이벤트나 수정 버튼 클릭 후 삭제 범위 all 선택
    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    // 삭제 범위 all 선택
    const allRadio = screen.getByLabelText('모든 반복 일정 삭제');
    await user.click(allRadio);

    // 일정 목록에서 해당 그룹 중 하나의 삭제 버튼 클릭
    const list = within(screen.getByTestId('event-list'));
    const delButtons = await list.findAllByLabelText('Delete event');
    await user.click(delButtons[0]);

    // 확인 다이얼로그에서 삭제 확정
    await user.click(screen.getByText('삭제'));

    // 두 항목 모두 사라짐
    expect(list.queryByText('반복 회의 1')).not.toBeInTheDocument();
    expect(list.queryByText('반복 회의 2')).not.toBeInTheDocument();
  });

  it('삭제 확인 다이얼로그에서 취소하면 삭제되지 않는다', async () => {
    setupMockHandlerBulkOperations(makeGroupEvents('repeat-del-cancel'));
    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');
    const list = within(screen.getByTestId('event-list'));
    const delButtons = await list.findAllByLabelText('Delete event');
    await user.click(delButtons[0]);
    await user.click(screen.getByText('취소'));
    // 여전히 항목 존재
    expect(list.getByText('반복 회의 1')).toBeInTheDocument();
  });

  it('단일 일정 삭제는 확인 없이 즉시 삭제된다', async () => {
    // 단일 일정 mock
    const single: Event[] = [
      {
        id: 's1',
        title: '단일',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: 'L',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    setupMockHandlerBulkOperations(single);
    let current = [...single];
    // 단일 삭제 경로 오버라이드
    server.use(
      http.get('/api/events', () => HttpResponse.json({ events: current })),
      http.delete('/api/events/:id', ({ params }) => {
        const { id } = params;
        const idx = current.findIndex((e) => String(e.id) === String(id));
        if (idx !== -1) {
          current.splice(idx, 1);
          return new HttpResponse(null, { status: 204 });
        }
        return new HttpResponse(null, { status: 404 });
      })
    );
    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');
    const list = within(screen.getByTestId('event-list'));
    const delButtons = await list.findAllByLabelText('Delete event');
    await user.click(delButtons[0]);
    expect(list.queryByText('단일')).not.toBeInTheDocument();
  });
});
