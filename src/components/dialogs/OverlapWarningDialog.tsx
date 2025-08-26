import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';

import type { Event } from '../../types';

type OverlapWarningDialogProps = {
  isOpen: boolean;
  events: Event[];
  onCancel: () => void;
  onProceed: () => void;
};

export function OverlapWarningDialog({
  isOpen,
  events,
  onCancel,
  onProceed,
}: OverlapWarningDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onCancel}>
      <DialogTitle>일정 겹침 경고</DialogTitle>
      <DialogContent>
        <DialogContentText component="div">
          다음 일정과 겹칩니다:
          {events.map((e) => (
            <Typography key={e.id}>
              {e.title} ({e.date} {e.startTime}-{e.endTime})
            </Typography>
          ))}
          계속 진행하시겠습니까?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>취소</Button>
        <Button color="error" onClick={onProceed}>
          계속 진행
        </Button>
      </DialogActions>
    </Dialog>
  );
}
