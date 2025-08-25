import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';

import { setupMockHandlerBulkOperations } from '../../__mocks__/handlersUtils';
import App from '../../App';
import type { Event } from '../../types';

const theme = createTheme();

const setup = () => {
  const user = userEvent.setup();
  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <App />
        </SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

function makeGroupEvents(groupId: string): Event[] {
  return [
    {
      id: 'g1',
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
      id: 'g2',
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

describe('Regression - Story 3.1 UI', () => {
  it('선택 모드에서 그룹 선택 후 "그룹 수정"으로 일괄 제목 변경이 반영된다', async () => {
    setupMockHandlerBulkOperations(makeGroupEvents('repeat-xyz'));
    const { user } = setup();

    // 초기 로딩 완료 스낵바 대기
    await screen.findByText('일정 로딩 완료!');

    // 선택 모드 진입
    await user.click(screen.getByText('선택 모드'));

    // 첫 그룹 항목의 체크박스 체크 ("그룹 선택" 레이블 인접 체크박스 선택)
    const groupLabels = await screen.findAllByText('그룹 선택');
    const labelStack = groupLabels[0].closest('div')!; // Typography -> Stack div
    const checkbox = within(labelStack.parentElement as HTMLElement).getByRole('checkbox');
    await user.click(checkbox);

    // 그룹 수정 -> 제목 변경 저장
    await user.click(screen.getByText('그룹 수정'));
    const input = within(screen.getByRole('dialog')).getByLabelText('새 제목');
    await user.type(input, '그룹 제목');
    await user.click(screen.getByText('저장'));

    // 두 항목 모두 변경된 제목 표시
    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getAllByText('그룹 제목').length).toBeGreaterThanOrEqual(2);
  });

  it('선택 모드에서 그룹 선택 후 "그룹 삭제"로 그룹의 모든 항목이 삭제된다', async () => {
    setupMockHandlerBulkOperations(makeGroupEvents('repeat-delete'));
    const { user } = setup();

    await screen.findByText('일정 로딩 완료!');
    await user.click(screen.getByText('선택 모드'));

    const groupLabels = await screen.findAllByText('그룹 선택');
    const labelStack = groupLabels[0].closest('div')!;
    const checkbox = within(labelStack.parentElement as HTMLElement).getByRole('checkbox');
    await user.click(checkbox);

    await user.click(screen.getByText('그룹 삭제'));

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.queryByText('반복 회의 1')).not.toBeInTheDocument();
    expect(eventList.queryByText('반복 회의 2')).not.toBeInTheDocument();
  });
});
