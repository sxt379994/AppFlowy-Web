import { UIVariant, View } from '@/application/types';

import OutlineItem from './OutlineItem';
import { AppOutlineItem } from './AppOutlineItem';

export function MobileOutline ({
  outline,
  variant,
  selectedViewId,
  navigateToView,
  onClose,
  loadChildren,
  loadedViewIds,
}: {
  outline: View[];
  variant?: UIVariant;
  selectedViewId?: string;
  navigateToView?: (viewId: string) => Promise<void>;
  onClose: () => void;
  loadChildren?: (viewId: string) => Promise<View[]>;
  loadedViewIds?: Set<string>;
}) {
  return (
    <div className={'flex w-full flex-1 flex-col gap-2 py-[10px]'}>
      {variant === UIVariant.App ? outline.map((view) => (
        <AppOutlineItem
          key={view.view_id}
          view={view}
          selectedViewId={selectedViewId}
          loadChildren={loadChildren}
          loadedViewIds={loadedViewIds}
          navigateToView={async (viewId) => {
            await navigateToView?.(viewId);
            onClose();
          }}
        />
      )) : outline.map((view) =>
        <OutlineItem
          variant={variant}
          key={view.view_id}
          selectedViewId={selectedViewId}
          view={view}
          navigateToView={async (viewId: string) => {
            await navigateToView?.(viewId);
            onClose();
          }}
        />,
      )}
    </div>
  );
}

export default MobileOutline;
