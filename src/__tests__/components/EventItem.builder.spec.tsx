import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { EventItem } from '../../components/EventItem';
import type { Event } from '../../types';
import { buildEvent, withRepeat } from '../utils/builders';

describe('EventItem (builders 적용)', () => {
  it('반복 없음 + 알림 없음: 반복 아이콘/알림 아이콘이 노출되지 않는다 (GWT)', () => {
    // Given
    const event: Event = buildEvent({ title: '회의', repeat: withRepeat('none') });

    // When
    render(<EventItem event={event} isNotified={false} />);

    // Then
    expect(screen.queryByTestId('repeat-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('notification-icon')).not.toBeInTheDocument();
    expect(screen.getByText('회의')).toBeInTheDocument();
  });

  it('반복 유형별 아이콘이 올바르게 표시된다 (table-driven, builders)', () => {
    // Given
    const cases = [
      { type: 'daily' as const, icon: '🔄' },
      { type: 'weekly' as const, icon: '📅' },
      { type: 'monthly' as const, icon: '📆' },
      { type: 'yearly' as const, icon: '🎯' },
    ];

    // When / Then
    cases.forEach(({ type, icon }) => {
      const e = buildEvent({ title: `반복-${type}`, repeat: withRepeat(type) });
      const { unmount } = render(<EventItem event={e} isNotified={false} />);
      expect(screen.getByTestId('repeat-icon')).toHaveTextContent(icon);
      unmount();
    });
  });

  it('알림 상태인 경우 알림 아이콘이 노출된다 (builders)', () => {
    // Given
    const event: Event = buildEvent({ title: '알림 일정', repeat: withRepeat('none') });

    // When
    render(<EventItem event={event} isNotified={true} />);

    // Then
    expect(screen.getByTestId('notification-icon')).toBeInTheDocument();
    expect(screen.getByText('알림 일정')).toBeInTheDocument();
  });
});
