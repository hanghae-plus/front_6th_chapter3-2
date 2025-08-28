import { render, screen } from '@testing-library/react';

import { CalendarCell } from '../../components/CalendarCell';

describe('CalendarCell', () => {
  it('day가 없으면 영역만 렌더링된다', () => {
    render(<CalendarCell events={[]} notifiedEvents={[]} day={null} />);
    const cell = screen.getByRole('cell');
    expect(cell).toBeInTheDocument();
    expect(cell.innerHTML).toBe('');
  });

  it('day가 있으면 날짜가 렌더링된다', () => {
    render(<CalendarCell events={[]} notifiedEvents={[]} day={1} />);
    expect(screen.getByRole('cell')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('휴일이 있으면 휴일이 렌더링된다', () => {
    render(<CalendarCell events={[]} notifiedEvents={[]} day={1} holiday="휴일" />);
    expect(screen.getByRole('cell')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('휴일')).toBeInTheDocument();
  });

  it('이벤트가 있으면 이벤트가 렌더링된다', () => {
    render(
      <CalendarCell
        events={[
          {
            id: '1',
            title: '이벤트',
            date: '2021-01-01',
            startTime: '10:00',
            endTime: '11:00',
            description: '설명',
            location: '위치',
            category: '카테고리',
            repeat: {
              type: 'none',
              interval: 0,
            },
            notificationTime: 0,
          },
        ]}
        notifiedEvents={[]}
        day={1}
      />
    );
    expect(screen.getByRole('cell')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('이벤트')).toBeInTheDocument();
  });

  it('알림된 이벤트가 있으면 알림 아이콘이 렌더링된다', () => {
    render(
      <CalendarCell
        events={[
          {
            id: '1',
            title: '이벤트',
            date: '2021-01-01',
            startTime: '10:00',
            endTime: '11:00',
            description: '설명',
            location: '위치',
            category: '카테고리',
            repeat: {
              type: 'none',
              interval: 0,
            },
            notificationTime: 0,
          },
        ]}
        notifiedEvents={['1']}
        day={1}
      />
    );
    expect(screen.getByRole('cell')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('이벤트')).toBeInTheDocument();
    expect(screen.getByTestId('NotificationsIcon')).toBeInTheDocument();
  });

  it('반복 이벤트는 배경색이 주황색이다', () => {
    render(
      <CalendarCell
        events={[
          {
            id: '1',
            title: '이벤트',
            date: '2021-01-01',
            startTime: '10:00',
            endTime: '11:00',
            description: '설명',
            location: '위치',
            category: '카테고리',
            repeat: {
              type: 'daily',
              interval: 1,
            },
            notificationTime: 0,
          },
        ]}
        notifiedEvents={[]}
        day={1}
      />
    );
    expect(screen.getByRole('cell')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('이벤트')).toBeInTheDocument();
    const boxStyle = getComputedStyle(screen.getByTestId('box'));
    expect(boxStyle.backgroundColor).toBe('rgb(255, 243, 224)');
    expect(boxStyle.color).toBe('rgb(255, 111, 0)');
  });
});
