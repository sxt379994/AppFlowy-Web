import { act, fireEvent, render, screen } from '@testing-library/react';

import GridNewRow from '../GridNewRow';

const mockCreate = jest.fn();
const mockReveal = jest.fn();
const mockError = jest.fn();
let mockReadOnly = false;
let mockEmbedded = false;
let mockCompact = true;

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, fallback?: string) => fallback || key }) }));
jest.mock('sonner', () => ({ toast: { error: (...args: unknown[]) => mockError(...args) } }));
jest.mock('@/application/database-yjs', () => ({
  useDatabaseContext: () => ({ isDocumentBlock: mockEmbedded }),
  useDatabaseFields: () => ({}),
  useDatabaseView: () => ({}),
  useReadOnly: () => mockReadOnly,
}));
jest.mock('@/application/database-yjs/dispatch', () => ({ useNewRowDispatch: () => mockCreate }));
jest.mock('@/application/database-yjs/group-row', () => ({ getGroupRowCellsData: () => ({ status: 'group-value' }) }));
jest.mock('@/components/database/grid/useGridContext', () => ({ useGridContext: () => ({ lastVisibleRowId: 'previous', revealCreatedRow: mockReveal }) }));
jest.mock('@/utils/use-compact-layout', () => ({ useCompactLayout: () => mockCompact }));

beforeEach(() => { jest.clearAllMocks(); mockReadOnly = false; mockEmbedded = false; mockCompact = true; });

it.each([false, true])('opens a newly created phone record and ignores pending repeat taps (embedded=%s)', async (embedded) => {
  mockEmbedded = embedded;
  let resolve!: () => void;

  mockCreate.mockImplementation(() => new Promise<void>((done) => { resolve = done; }));
  render(<GridNewRow groupFieldId='status' groupId='group-value' />);
  const button = screen.getByRole('button');

  fireEvent.click(button);
  fireEvent.click(button);
  expect(mockCreate).toHaveBeenCalledTimes(1);
  expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ openAfterCreate: true, cellsData: { status: 'group-value' } }));
  if (embedded) expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ beforeRowId: 'previous', tailing: false }));
  await act(async () => resolve());
  expect(mockReveal).toHaveBeenCalledTimes(1);
});

it('preserves desktop creation behavior', async () => {
  mockCompact = false;
  mockCreate.mockResolvedValue(undefined);
  render(<GridNewRow />);
  await act(async () => fireEvent.click(screen.getByRole('button')));
  expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ openAfterCreate: false }));
});

it('does not create in a read-only view', () => {
  mockReadOnly = true;
  render(<GridNewRow />);
  fireEvent.click(screen.getByRole('button'));
  expect(mockCreate).not.toHaveBeenCalled();
});

it('reports a failed creation without automatically retrying', async () => {
  mockCreate.mockRejectedValue(new Error('offline'));
  render(<GridNewRow />);
  await act(async () => fireEvent.click(screen.getByRole('button')));
  expect(mockError).toHaveBeenCalledTimes(1);
  expect(mockReveal).not.toHaveBeenCalled();
  expect(mockCreate).toHaveBeenCalledTimes(1);
});
