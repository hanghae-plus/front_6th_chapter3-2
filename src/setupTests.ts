import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

import { handlers } from './__mocks__/handlers';

// ! Hard 여기 제공 안함
/* msw */
export const server = setupServer(...handlers);

vi.stubEnv('TZ', 'UTC');

// 콘솔 경고 최소화: MUI Select out-of-range(`none`) 경고를 명시적으로 필터링
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  const shouldFilter = (msg: unknown): boolean => {
    const text = String(msg ?? '');
    return (
      text.includes('MUI: You have provided an out-of-range value') &&
      text.includes('select component')
    );
  };

  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    if (shouldFilter(args[0])) return;
    (originalConsoleError as (..._args: unknown[]) => void)(...args);
  });

  vi.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
    if (shouldFilter(args[0])) return;
    (originalConsoleWarn as (..._args: unknown[]) => void)(...args);
  });
});

beforeAll(() => {
  server.listen();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

beforeEach(() => {
  expect.hasAssertions(); // ? Med: 이걸 왜 써야하는지 물어보자

  vi.setSystemTime(new Date('2025-10-01')); // ? Med: 이걸 왜 써야하는지 물어보자
});

afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
  server.close();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
