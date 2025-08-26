import { screen } from '@testing-library/react';
import { vi } from 'vitest';

import { DeleteConfirmDialog } from '../../../components/dialogs/DeleteConfirmDialog';
import { setup } from '../../utils/setup-render';

describe('DeleteConfirmDialog', () => {
  it('isAll=true면 전체 삭제 문구가 표시된다', () => {
    setup(
      <DeleteConfirmDialog isOpen={true} isAll={true} onCancel={() => {}} onConfirm={() => {}} />
    );
    expect(screen.getByText('정말 모든 반복 일정을 삭제하시겠습니까?')).toBeInTheDocument();
  });

  it('isAll=false면 단일 삭제 문구가 표시된다', () => {
    setup(
      <DeleteConfirmDialog isOpen={true} isAll={false} onCancel={() => {}} onConfirm={() => {}} />
    );
    expect(screen.getByText('정말 이 일정을 삭제하시겠습니까?')).toBeInTheDocument();
  });

  it('삭제/취소 버튼 콜백이 호출된다', async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    const { user } = setup(
      <DeleteConfirmDialog isOpen={true} isAll={false} onCancel={onCancel} onConfirm={onConfirm} />
    );
    await user.click(screen.getByText('삭제'));
    expect(onConfirm).toHaveBeenCalled();
    onConfirm.mockReset();
    await user.click(screen.getByText('취소'));
    expect(onCancel).toHaveBeenCalled();
  });
});
