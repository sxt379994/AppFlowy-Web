import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useDatabaseContextOptional, useReadOnly } from '@/application/database-yjs';
import { useDuplicateRowDispatch, useTrashAwareDeleteRowsDispatch } from '@/application/database-yjs/dispatch';
import { ReactComponent as ArrowLeftIcon } from '@/assets/icons/arrow_left.svg';
import { ReactComponent as DeleteIcon } from '@/assets/icons/delete.svg';
import { ReactComponent as DuplicateIcon } from '@/assets/icons/duplicate.svg';
import { ReactComponent as ExpandIcon } from '@/assets/icons/full_screen.svg';
import { ReactComponent as MoreIcon } from '@/assets/icons/more.svg';
import { AFScroller } from '@/components/_shared/scroller';
import { DatabaseRow } from '@/components/database/DatabaseRow';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCompactLayout } from '@/utils/use-compact-layout';

function DatabaseRowModal({
  open,
  onOpenChange,
  rowId,
  openPage,
}: {
  open: boolean;
  rowId: string;
  onOpenChange: (open: boolean) => void;
  openPage?: (rowId: string) => void;
}) {
  const context = useDatabaseContextOptional();
  const openPageModalViewId = context?.openPageModalViewId;
  const readOnly = useReadOnly();
  const { t } = useTranslation();
  const duplicateRow = useDuplicateRowDispatch();
  const deleteRows = useTrashAwareDeleteRowsDispatch();
  const [duplicateLoading, setDuplicateLoading] = useState(false);
  const compact = useCompactLayout();

  return (
    <Dialog
      open={open}
      onClose={() => {
        onOpenChange(false);
      }}
      fullWidth={true}
      fullScreen={compact}
      keepMounted={false}
      disableAutoFocus={false}
      disableEnforceFocus={false}
      disableRestoreFocus={!compact}
      hideBackdrop={!!openPageModalViewId}
      PaperProps={{
        className: compact
          ? 'relative m-0 flex h-[100dvh] max-h-[100dvh] w-full max-w-full flex-col overflow-hidden rounded-none'
          : 'max-w-[70vw] relative w-[1188px] h-[80vh] overflow-hidden flex flex-col',
        style: compact ? {
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        } : undefined,
      }}
    >
      <DialogContent className={'flex h-full w-full flex-col px-0 py-0'}>
        <DialogTitle component='div' className={'flex h-14 shrink-0 items-center justify-end gap-2 border-b border-border-primary px-2 py-1'}>
          <div className='flex flex-1 items-center'>
            {(compact || openPageModalViewId) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size={'icon'}
                    variant='ghost'
                    aria-label={t('button.back', 'Back')}
                    className={compact ? 'h-11 w-11' : undefined}
                    onClick={() => {
                      onOpenChange(false);
                    }}
                  >
                    <ArrowLeftIcon className='h-5 w-5' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Go back</TooltipContent>
              </Tooltip>
            )}
          </div>

          {openPage ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-testid='row-detail-open-full-page'
                  aria-label={t('grid.rowPage.openAsFullPage')}
                  className={compact ? 'h-11 w-11' : undefined}
                  size={'icon'}
                  variant='ghost'
                  onClick={() => {
                    openPage?.(rowId);
                    onOpenChange(false);
                  }}
                >
                  <ExpandIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('grid.rowPage.openAsFullPage')}</TooltipContent>
            </Tooltip>
          ) : null}
          {!readOnly ? (
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={compact ? 'h-11 w-11' : 'h-7 w-7'}>
                    <DropdownMenuTrigger asChild>
                      <Button size={'icon'} variant='ghost' aria-label={t('grid.rowPage.moreRowActions')} className={compact ? 'h-11 w-11' : undefined} data-testid='row-detail-more-actions'>
                        <MoreIcon />
                      </Button>
                    </DropdownMenuTrigger>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{t('grid.rowPage.moreRowActions')}</TooltipContent>
              </Tooltip>
              <DropdownMenuContent className={' w-fit min-w-fit'}>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    data-testid='row-detail-duplicate'
                    onSelect={async () => {
                      if (duplicateLoading) return;
                      setDuplicateLoading(true);
                      try {
                        await duplicateRow?.(rowId);
                        onOpenChange(false);
                        // eslint-disable-next-line
                      } catch (e: any) {
                        toast.error(e.message);
                      } finally {
                        setDuplicateLoading(false);
                      }
                    }}
                  >
                    {duplicateLoading ? <Progress variant={'primary'} /> : <DuplicateIcon className={'h-5 w-5'} />}

                    {t('grid.row.duplicate')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant={'destructive'}
                    data-testid='row-detail-delete'
                    onSelect={() => {
                      void deleteRows([rowId]).catch((e: Error) => {
                        toast.error(e.message);
                      });
                      onOpenChange(false);
                    }}
                  >
                    <DeleteIcon className={'h-5 w-5'} />
                    {t('grid.row.delete')}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </DialogTitle>

        <AFScroller overflowXHidden className={'appflowy-scroll-container min-h-0 w-full flex-1'}>
          <DatabaseRow rowId={rowId} />
        </AFScroller>
      </DialogContent>
    </Dialog>
  );
}

export default DatabaseRowModal;
