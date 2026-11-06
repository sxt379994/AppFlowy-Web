import { IconButton } from '@mui/material';
import { RefreshCw } from 'lucide-react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { HEADER_HEIGHT } from '@/application/constants';
import { UIVariant } from '@/application/types';
import { ReactComponent as MenuIcon } from '@/assets/icons/double_arrow_right.svg';
import { ReactComponent as MoreIcon } from '@/assets/icons/more.svg';
import { Breadcrumb } from '@/components/_shared/breadcrumb';
import { withAppBreadcrumb } from '@/components/_shared/breadcrumb/withAppBreadcrumb';
import { withPublishBreadcrumb } from '@/components/_shared/breadcrumb/withPublishBreadcrumb';
import { MobileDrawer } from '@/components/_shared/mobile-drawer';
import MobileFolder from '@/components/_shared/mobile-topbar/MobileFolder';
import PublishMobileFolder from '@/components/_shared/mobile-topbar/PublishMobileFolder';
import MoreActionsContent from '@/components/_shared/more-actions/MoreActionsContent';
import { useViewportWidth } from '@/utils/use-compact-layout';

const PublishBreadcrumb = withPublishBreadcrumb(Breadcrumb);
const AppBreadcrumb = withAppBreadcrumb(Breadcrumb);

function MobileTopBar({ variant }: { variant?: UIVariant }) {
  const { t } = useTranslation();
  const [openFolder, setOpenFolder] = React.useState(false);
  const [openMore, setOpenMore] = React.useState(false);
  const viewportWidth = useViewportWidth();
  const folderDrawerWidth = Math.min(420, Math.max(0, viewportWidth - 24));

  const handleOpenFolder = useCallback(() => {
    setOpenFolder(true);
  }, []);

  const handleCloseFolder = useCallback(() => {
    setOpenFolder(false);
  }, []);

  const handleOpenMore = useCallback(() => {
    setOpenMore(true);
  }, []);
  const handleCloseMore = useCallback(() => {
    setOpenMore(false);
  }, []);
  const topBarHeight = `calc(${HEADER_HEIGHT}px + env(safe-area-inset-top, 0px))`;

  return (
    <div
      style={{
        backdropFilter: 'saturate(180%) blur(16px)',
        background: 'var(--bg-header)',
        height: topBarHeight,
        minHeight: topBarHeight,
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
      className={
        'appflowy-top-bar sticky top-0 z-[100] flex h-[48px] min-h-[48px] w-full transform-gpu items-center justify-between gap-2 px-4'
      }
    >
      <MobileDrawer
        swipeAreaWidth={folderDrawerWidth}
        onOpen={handleOpenFolder}
        onClose={handleCloseFolder}
        open={openFolder}
        anchor={'left'}
        showPuller={false}
        topOffset={topBarHeight}
        triggerNode={
          <IconButton aria-label={t('sideBar.Spaces', 'Spaces')} aria-expanded={openFolder} sx={{ width: 44, height: 44 }}>
            <MenuIcon />
          </IconButton>
        }
      >
        {variant === UIVariant.App ? (
          <MobileFolder onClose={handleCloseFolder} />
        ) : (
          <PublishMobileFolder onClose={handleCloseFolder} />
        )}
      </MobileDrawer>

      <div className='min-w-0 flex-1 overflow-hidden'>
        {variant === UIVariant.Publish ? <PublishBreadcrumb /> : <AppBreadcrumb />}
      </div>
      <div className={'flex items-center gap-2'}>
        {variant === UIVariant.App ? (
          <IconButton
            aria-label={t('settings.files.refresh', 'Refresh')}
            onClick={() => window.location.reload()}
            size='small'
            sx={{ width: 44, height: 44 }}
          >
            <RefreshCw className='h-5 w-5' />
          </IconButton>
        ) : null}
        <MobileDrawer
          onOpen={handleOpenMore}
          onClose={handleCloseMore}
          open={openMore}
          anchor={'bottom'}
          triggerNode={
            <IconButton aria-label={t('more', 'More actions')} aria-expanded={openMore} sx={{ width: 44, height: 44 }} className={'opacity-70'}>
              <MoreIcon />
            </IconButton>
          }
        >
          <div className={'h-full w-full px-2 pt-10'}>
            <MoreActionsContent itemClicked={handleCloseMore} />
          </div>
        </MobileDrawer>
      </div>
    </div>
  );
}

export default MobileTopBar;
