import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useDatabaseContext, useDatabaseFields, useDatabaseView, useReadOnly } from '@/application/database-yjs';
import { useNewRowDispatch } from '@/application/database-yjs/dispatch';
import { getGroupRowCellsData } from '@/application/database-yjs/group-row';
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
import { useGridContext } from '@/components/database/grid/useGridContext';
import { cn } from '@/lib/utils';
import { useCompactLayout } from '@/utils/use-compact-layout';

export const getGridGroupCellsData = getGroupRowCellsData;

export function useCreateGridGroupRow(groupFieldId?: string, groupId?: string, compactOverride?: boolean) {
  const onNewRow = useNewRowDispatch();
  const { isDocumentBlock } = useDatabaseContext();
  const { lastVisibleRowId, revealCreatedRow } = useGridContext();
  const fields = useDatabaseFields();
  const view = useDatabaseView();
  const compactLayout = useCompactLayout();
  const compact = compactOverride ?? compactLayout;

  return useCallback(async () => {
    const cellsData = getGridGroupCellsData(fields, groupFieldId, groupId, view);

    await onNewRow(
      isDocumentBlock
        ? {
            beforeRowId: lastVisibleRowId,
            cellsData,
            tailing: !lastVisibleRowId,
            openAfterCreate: compact,
          }
        : { cellsData, tailing: true, openAfterCreate: compact }
    );
    revealCreatedRow();
  }, [compact, fields, groupFieldId, groupId, isDocumentBlock, lastVisibleRowId, onNewRow, revealCreatedRow, view]);
}

function GridNewRow({ groupFieldId, groupId, compact }: { groupFieldId?: string; groupId?: string; compact?: boolean }) {
  const { t } = useTranslation();
  const compactLayout = useCompactLayout();
  const isMobile = compact ?? compactLayout;
  const createRow = useCreateGridGroupRow(groupFieldId, groupId, isMobile);
  const readOnly = useReadOnly();
  const busy = useRef(false);
  const [creating, setCreating] = useState(false);

  return (
    <button
      type='button'
      disabled={readOnly || creating}
      aria-busy={creating}
      data-testid='grid-new-row'
      onClick={async () => {
        if (busy.current || readOnly) return;
        busy.current = true;
        setCreating(true);
        try {
          await createRow();
        } catch {
          toast.error(t('grid.row.createFailed', 'Could not create the record. Check the list before trying again.'));
        } finally {
          busy.current = false;
          setCreating(false);
        }
      }}
      className={cn(
        'flex w-full flex-1 cursor-pointer items-center gap-1.5 border-b border-t border-border-primary bg-fill-content px-3 py-2 text-sm font-medium text-text-secondary hover:bg-fill-content-hover disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2',
        isMobile ? 'h-12' : 'h-9'
      )}
      data-group-id={groupId}
    >
      <PlusIcon className={'h-5 w-5'} />
      {t('grid.row.newRow')}
    </button>
  );
}

export default GridNewRow;
