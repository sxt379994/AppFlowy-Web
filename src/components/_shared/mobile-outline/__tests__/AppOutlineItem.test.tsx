import { act, fireEvent, render, screen } from '@testing-library/react';

import { View, ViewLayout } from '@/application/types';

import { AppOutlineItem } from '../AppOutlineItem';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }) }));
jest.mock('@/components/_shared/view-icon/PageIcon', () => ({ __esModule: true, default: () => <span /> }));
jest.mock('@/components/_shared/view-icon/SpaceIcon', () => ({ __esModule: true, default: () => <span /> }));

const parent = { view_id: 'space', name: 'Projects', children: [], has_children: true, extra: { is_space: true }, layout: ViewLayout.Document } as unknown as View;
const child = { view_id: 'child', name: 'A deeper project', children: [], has_children: false, layout: ViewLayout.Document } as unknown as View;

it('loads an unloaded branch, navigates by identity and drops revoked children', async () => {
  let resolve!: (views: View[]) => void;
  const loadChildren = jest.fn(() => new Promise<View[]>((done) => { resolve = done; }));
  const navigate = jest.fn().mockResolvedValue(undefined);
  const props = { view: parent, loadChildren, navigateToView: navigate, loadedViewIds: new Set<string>() };
  const { rerender } = render(<AppOutlineItem {...props} />);

  fireEvent.click(screen.getByRole('button', { name: 'Expand Projects' }));
  expect(loadChildren).toHaveBeenCalledWith('space');
  expect(screen.getByRole('status').textContent).toBe('Loading…');
  await act(async () => resolve([child]));
  rerender(<AppOutlineItem {...props} view={{ ...parent, children: [child] }} loadedViewIds={new Set(['space'])} />);
  fireEvent.click(screen.getByRole('button', { name: 'A deeper project' }));
  expect(navigate).toHaveBeenCalledWith('child');
  rerender(<AppOutlineItem {...props} view={{ ...parent, children: [], has_children: false }} />);
  expect(screen.queryByText('A deeper project')).toBeNull();
});

it('offers a retry when the loader cannot obtain children', async () => {
  const loadChildren = jest.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce([]);

  render(<AppOutlineItem view={parent} loadChildren={loadChildren} />);
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Projects' })));
  expect(screen.getByText(/Some pages could not be loaded/)).toBeTruthy();
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Retry' })));
  expect(loadChildren).toHaveBeenCalledTimes(2);
});

it('does not refetch a loaded branch on every expand', () => {
  const loadChildren = jest.fn();

  render(<AppOutlineItem view={{ ...parent, children: [child] }} loadChildren={loadChildren} loadedViewIds={new Set(['space'])} />);
  fireEvent.click(screen.getByRole('button', { name: 'Expand Projects' }));
  expect(screen.getByRole('button', { name: 'A deeper project' })).toBeTruthy();
  expect(loadChildren).not.toHaveBeenCalled();
});
