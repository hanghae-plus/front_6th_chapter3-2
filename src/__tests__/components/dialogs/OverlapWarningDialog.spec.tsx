import { screen } from '@testing-library/react';
import { vi } from 'vitest';

import { OverlapWarningDialog } from '../../../components/dialogs/OverlapWarningDialog';
import { buildEvent } from '../../utils/builders';
import { setup } from '../../utils/setup-render';

const sampleEvents = [
  buildEvent({
    id: 'e1',
    title: '회의',
    date: '2025-01-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  }),
  buildEvent({
    id: 'e2',
    title: '미팅',
    date: '2025-01-01',
    startTime: '09:30',
    endTime: '10:30',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  }),
];

describe('OverlapWarningDialog', () => {
  it('겹치는 이벤트 목록을 렌더링한다', () => {
    setup(
      <OverlapWarningDialog isOpen events={sampleEvents} onCancel={() => {}} onProceed={() => {}} />
    );
    expect(screen.getByText('회의 (2025-01-01 09:00-10:00)')).toBeInTheDocument();
    expect(screen.getByText('미팅 (2025-01-01 09:30-10:30)')).toBeInTheDocument();
  });

  it('취소/계속 진행 콜백이 호출된다', async () => {
    const onCancel = vi.fn();
    const onProceed = vi.fn();
    const { user } = setup(
      <OverlapWarningDialog
        isOpen
        events={sampleEvents}
        onCancel={onCancel}
        onProceed={onProceed}
      />
    );
    await user.click(screen.getByText('취소'));
    expect(onCancel).toHaveBeenCalled();
    await user.click(screen.getByText('계속 진행'));
    expect(onProceed).toHaveBeenCalled();
  });
});
