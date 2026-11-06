import { fireEvent, render, screen } from '@testing-library/react';

import { MobileRecordButton } from '../MobileRecordButton';

const mockNavigate = jest.fn();
let mockTitle = '';
let mockLoaded = true;

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }) }));
jest.mock('@/application/database-yjs', () => ({
  useDatabaseContext: () => ({ navigateToRow: mockNavigate, readOnly: true }),
  useCellSelector: () => ({ data: mockTitle }),
  useRowMetaSelector: () => ({ icon: '📋' }),
  useIsRowLoaded: () => mockLoaded,
}));

beforeEach(() => { mockNavigate.mockClear(); mockTitle = ''; mockLoaded = true; });

it('makes the entire untitled row one semantic open button, even when read-only', () => {
  render(<MobileRecordButton rowId='r1' fieldId='title' />);
  const button = screen.getByRole('button', { name: 'Untitled' });

  expect(button.className).toContain('min-h-12');
  fireEvent.click(button);
  expect(mockNavigate).toHaveBeenCalledTimes(1);
  expect(mockNavigate).toHaveBeenCalledWith('r1');
  expect(button.querySelector('button,input,textarea,a')).toBeNull();
});

it('renders a loading state instead of pretending an unloaded row is untitled', () => {
  mockLoaded = false;
  render(<MobileRecordButton rowId='r2' fieldId='title' />);
  expect(screen.getByRole('button', { name: 'Loading…' })).toBeTruthy();
});

it('does not treat a title that looks like a URL as a separate navigation target', () => {
  mockTitle = 'https://example.com';
  render(<MobileRecordButton rowId='r3' fieldId='title' />);
  fireEvent.click(screen.getByRole('button', { name: mockTitle }));
  expect(mockNavigate).toHaveBeenCalledWith('r3');
  expect(screen.queryByRole('link')).toBeNull();
});
