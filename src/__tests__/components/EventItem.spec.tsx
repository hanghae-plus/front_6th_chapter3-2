import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { EventItem } from '../../components/EventItem';
import type { Event } from '../../types';

describe('EventItem', () => {
  const baseEvent: Event = {
    id: '1',
    title: '일반 회의',
    date: '2024-01-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '',
    notificationTime: 0,
    repeat: { type: 'none', interval: 0 },
  };

  it('일반 일정은 반복 아이콘 없이 표시되어야 함', () => {
    render(<EventItem event={baseEvent} isNotified={false} />);

    expect(screen.queryByTestId('repeat-icon')).not.toBeInTheDocument();
    expect(screen.getByText('일반 회의')).toBeInTheDocument();
  });

  it('반복 일정은 반복 유형에 맞는 아이콘과 함께 표시되어야 함', () => {
    const repeatingEvent: Event = {
      ...baseEvent,
      title: '반복 회의',
      repeat: { type: 'daily', interval: 1 },
    };

    render(<EventItem event={repeatingEvent} isNotified={false} />);

    expect(screen.getByTestId('repeat-icon')).toBeInTheDocument();
    expect(screen.getByText('반복 회의')).toBeInTheDocument();
  });

  it('알림이 있는 일정은 알림 아이콘과 함께 표시되어야 함', () => {
    render(<EventItem event={baseEvent} isNotified={true} />);

    expect(screen.getByTestId('notification-icon')).toBeInTheDocument();
    expect(screen.getByText('일반 회의')).toBeInTheDocument();
  });

  it('반복 일정과 알림이 모두 있는 경우 두 아이콘이 모두 표시되어야 함', () => {
    const repeatingEvent: Event = {
      ...baseEvent,
      title: '반복 회의',
      repeat: { type: 'daily', interval: 1 },
    };

    render(<EventItem event={repeatingEvent} isNotified={true} />);

    expect(screen.getByTestId('repeat-icon')).toBeInTheDocument();
    expect(screen.getByTestId('notification-icon')).toBeInTheDocument();
    expect(screen.getByText('반복 회의')).toBeInTheDocument();
  });
});
