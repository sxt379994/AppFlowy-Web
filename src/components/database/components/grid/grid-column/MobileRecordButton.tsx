import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useCellSelector, useDatabaseContext, useIsRowLoaded, useRowMetaSelector } from '@/application/database-yjs';

export function MobileRecordButton({ rowId, fieldId }: { rowId: string; fieldId: string }) {
  const { navigateToRow } = useDatabaseContext();
  const cell = useCellSelector({ rowId, fieldId });
  const meta = useRowMetaSelector(rowId);
  const loaded = useIsRowLoaded(rowId);
  const { t } = useTranslation();
  const title = typeof cell?.data === 'string' || typeof cell?.data === 'number' ? String(cell.data) : '';

  return (
    <button
      type='button'
      data-testid={`mobile-record-${rowId}`}
      disabled={!navigateToRow}
      onClick={(event) => {
        event.stopPropagation();
        navigateToRow?.(rowId);
      }}
      className='flex min-h-12 w-full items-center gap-3 px-3 py-3 text-left text-base hover:bg-fill-content-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]'
    >
      {meta?.icon && <span aria-hidden='true' className='shrink-0'>{meta.icon}</span>}
      <span className='min-w-0 flex-1 break-words whitespace-normal'>
        {loaded ? title || t('menuAppHeader.defaultNewPageName', 'Untitled') : t('loading', 'Loading…')}
      </span>
      <ChevronRight aria-hidden='true' className='h-4 w-4 shrink-0 text-text-secondary' />
    </button>
  );
}
