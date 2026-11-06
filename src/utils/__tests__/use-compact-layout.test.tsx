import { act, renderHook } from '@testing-library/react';

import { useCompactLayout, useViewportWidth } from '../use-compact-layout';

describe('compact presentation', () => {
  const initialWidth = window.innerWidth;
  const initialMatchMedia = window.matchMedia;

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: initialWidth });
    window.matchMedia = initialMatchMedia;
  });

  it('reacts to resizing without relying on a phone user agent', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 });
    const { result } = renderHook(() => ({ compact: useCompactLayout(), width: useViewportWidth() }));

    expect(result.current).toEqual({ compact: false, width: 1280 });
    act(() => {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toEqual({ compact: true, width: 390 });
    act(() => {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 });
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.compact).toBe(false);
  });

  it('keeps a coarse-pointer phone compact in landscape', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 844 });
    window.matchMedia = jest.fn().mockReturnValue({ matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() });
    const { result } = renderHook(useCompactLayout);

    expect(result.current).toBe(true);
  });
});
