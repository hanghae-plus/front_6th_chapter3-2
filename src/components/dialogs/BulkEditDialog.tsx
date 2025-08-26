import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useState } from 'react';

type BulkEditDialogProps = {
  isOpen: boolean;
  onCancel: () => void;
  onSave: (value: string) => void;
};

export function BulkEditDialog({ isOpen, onCancel, onSave }: BulkEditDialogProps) {
  const [titleInput, setTitleInput] = useState('');
  const canSave = titleInput.trim().length > 0;

  return (
    <Dialog open={isOpen} onClose={onCancel}>
      <DialogTitle>그룹 수정</DialogTitle>
      <DialogContent>
        <DialogContentText>선택된 이벤트들의 제목을 일괄 변경합니다.</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="새 제목"
          fullWidth
          variant="standard"
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>취소</Button>
        <Button onClick={() => onSave(titleInput)} disabled={!canSave}>
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
