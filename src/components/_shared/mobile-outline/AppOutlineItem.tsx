import { ChevronDown, ChevronRight, Lock } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { View } from '@/application/types';
import PageIcon from '@/components/_shared/view-icon/PageIcon';
import SpaceIcon from '@/components/_shared/view-icon/SpaceIcon';
import { cn } from '@/lib/utils';

export interface AppOutlineItemProps {
  view: View;
  level?: number;
  selectedViewId?: string;
  navigateToView?: (viewId: string) => Promise<void>;
  loadChildren?: (viewId: string) => Promise<View[]>;
  loadedViewIds?: Set<string>;
}

export function AppOutlineItem({ view, level = 0, selectedViewId, navigateToView, loadChildren, loadedViewIds }: AppOutlineItemProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [navigationFailed, setNavigationFailed] = useState(false);
  const pending = useRef(false);
  const children = view.children || [];
  const isSpace = Boolean(view.extra?.is_space);
  const hasChildren = isSpace || children.length > 0 || view.has_children === true;
  const title = view.name || t('menuAppHeader.defaultNewPageName', 'Untitled');

  const load = async () => {
    if (!loadChildren || pending.current) return;
    pending.current = true;
    setLoading(true);
    setFailed(false);
    try {
      const result = await loadChildren(view.view_id);

      // The shared loader owns cache/permission invalidation and may return []
      // on failure. Never keep a private copy of its children after revocation.
      setFailed(result.length === 0 && view.has_children === true);
    } catch {
      setFailed(true);
    } finally {
      pending.current = false;
      setLoading(false);
    }
  };

  const toggle = () => {
    setExpanded(!expanded);
    if (!expanded && !loadedViewIds?.has(view.view_id)) void load();
  };

  return (
    <div className='min-w-0'>
      <div
        className={cn('flex min-h-12 items-center rounded-lg', selectedViewId === view.view_id && 'bg-fill-content-hover')}
        style={{ paddingLeft: Math.min(level, 4) * 12 }}
      >
        {hasChildren ? (
          <button
            type='button'
            aria-label={`${expanded ? t('collapse', 'Collapse') : t('expand', 'Expand')} ${title}`}
            aria-expanded={expanded}
            onClick={toggle}
            className='flex h-12 w-11 shrink-0 items-center justify-center rounded-lg focus-visible:outline'
          >
            {expanded ? <ChevronDown aria-hidden className='h-4 w-4' /> : <ChevronRight aria-hidden className='h-4 w-4' />}
          </button>
        ) : <span className='w-11 shrink-0' />}
        <button
          type='button'
          aria-current={selectedViewId === view.view_id ? 'page' : undefined}
          aria-expanded={isSpace ? expanded : undefined}
          onClick={async () => {
            if (isSpace) return toggle();
            setNavigationFailed(false);
            try {
              await navigateToView?.(view.view_id);
            } catch {
              setNavigationFailed(true);
            }
          }}
          className='flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-lg py-2 pr-3 text-left focus-visible:outline'
        >
          {isSpace ? (
            <SpaceIcon bgColor={view.extra?.space_icon_color} value={view.extra?.space_icon || ''} char={view.extra?.space_icon ? undefined : title.slice(0, 1)} />
          ) : <PageIcon view={view} iconSize={20} className='shrink-0' />}
          <span className='min-w-0 flex-1 break-words text-sm font-medium'>{title}</span>
          {view.is_private && <Lock aria-label={t('private', 'Private')} className='h-4 w-4 shrink-0 text-text-secondary' />}
        </button>
      </div>
      {navigationFailed && <p role='alert' className='px-3 py-2 text-sm'>{t('mobile.openFailed', 'Could not open this page. Please try again.')}</p>}
      {expanded && (
        <div>
          {loading && <p role='status' className='px-4 py-2 text-sm text-text-secondary'>{t('loading', 'Loading…')}</p>}
          {!loading && failed && (
            <div className='px-4 py-2 text-sm text-text-secondary'>
              <p role='status'>{t('mobile.childrenUnavailable', 'Some pages could not be loaded. Check your connection or access.')}</p>
              <button type='button' className='min-h-11 underline focus-visible:outline' onClick={() => void load()}>{t('retry', 'Retry')}</button>
            </div>
          )}
          {!loading && !failed && children.length === 0 && <p className='px-4 py-2 text-sm text-text-secondary'>{t('mobile.noPages', 'No pages here yet')}</p>}
          {children.map((child) => (
            <AppOutlineItem key={child.view_id} view={child} level={level + 1} selectedViewId={selectedViewId} navigateToView={navigateToView} loadChildren={loadChildren} loadedViewIds={loadedViewIds} />
          ))}
        </div>
      )}
    </div>
  );
}
