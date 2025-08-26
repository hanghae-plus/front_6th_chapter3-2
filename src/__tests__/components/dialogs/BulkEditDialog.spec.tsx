import { screen } from '@testing-library/react';
import { vi } from 'vitest';

import { BulkEditDialog } from '../../../components/dialogs/BulkEditDialog';
import { setup } from '../../utils/setup-render';

describe('BulkEditDialog', () => {
  it('입력 전에는 저장 버튼이 비활성화되어 있고, 입력 후 활성화된다', async () => {
    const onCancel = vi.fn();
    const onSave = vi.fn();
    const { user } = setup(<BulkEditDialog isOpen={true} onCancel={onCancel} onSave={onSave} />);

    const saveBtn = screen.getByText('저장');
    expect(saveBtn).toHaveAttribute('disabled');

    const input = screen.getByLabelText('새 제목');
    await user.type(input, '그룹 제목');

    expect(saveBtn).not.toHaveAttribute('disabled');
  });

  it('저장 클릭 시 onSave가 호출된다', async () => {
    const onCancel = vi.fn();
    const onSave = vi.fn();
    const { user } = setup(<BulkEditDialog isOpen={true} onCancel={onCancel} onSave={onSave} />);

    const input = screen.getByLabelText('새 제목');
    await user.type(input, '새 타이틀');
    await user.click(screen.getByText('저장'));
    expect(onSave).toHaveBeenCalledWith('새 타이틀');
  });

  it('취소 클릭 시 onCancel이 호출된다', async () => {
    const onCancel = vi.fn();
    const onSave = vi.fn();
    const { user } = setup(<BulkEditDialog isOpen={true} onCancel={onCancel} onSave={onSave} />);
    await user.click(screen.getByText('취소'));
    expect(onCancel).toHaveBeenCalled();
  });
});
