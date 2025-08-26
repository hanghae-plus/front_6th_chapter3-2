import { ThemeProvider } from '@emotion/react';
import { createTheme, CssBaseline } from '@mui/material';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { OverlayProvider } from 'overlay-kit';
import { ReactElement } from 'react';

export const setup = (element: ReactElement) => {
  const user = userEvent.setup();
  const theme = createTheme();

  return {
    ...render(
      <OverlayProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>{element}</SnackbarProvider>
        </ThemeProvider>
      </OverlayProvider>
    ),
    user,
  };
};
