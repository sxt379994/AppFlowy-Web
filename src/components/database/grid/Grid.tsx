import { useEffect, useRef } from 'react';

import { useDatabaseContext, useDatabaseViewId } from '@/application/database-yjs';
import { useRenderFields } from '@/components/database/components/grid/grid-column';
import GridVirtualizer from '@/components/database/components/grid/grid-table/GridVirtualizer';
import { useGridGrouping } from '@/components/database/grid/GridGroupingContext';
import { GridProvider } from '@/components/database/grid/GridProvider';
import { useElementWidth } from '@/utils/use-compact-layout';

export function Grid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = useElementWidth(containerRef);
  const { fields } = useRenderFields(containerWidth);
  const viewId = useDatabaseViewId();
  const grouping = useGridGrouping();
  const { rowOrders } = grouping;

  const { onRendered } = useDatabaseContext();

  useEffect(() => {
    if (fields && rowOrders !== undefined) {
      onRendered?.();
    }
  }, [fields, rowOrders, onRendered]);

  return (
    <GridProvider grouping={grouping}>
      <div
        ref={containerRef}
        data-testid='database-grid'
        // Rows the grid lists after filters and sorts; large-database tests read it.
        data-row-count={rowOrders?.length}
        className={`database-grid relative grid-table-${viewId} flex min-h-0 w-full flex-1 flex-col`}
      >
        <GridVirtualizer columns={fields} />
      </div>
    </GridProvider>
  );
}

export default Grid;
