import { memo } from 'react';

import { AppProvider } from '@/components/app/AppProvider';
import MainLayout from '@/components/app/MainLayout';
import MobileMainLayout from '@/components/app/MobileMainLayout';
import { useCompactLayout } from '@/utils/use-compact-layout';

export function AuthLayout () {
  const isMobile = useCompactLayout();

  return (
    <AppProvider>
      {isMobile ? <MobileMainLayout /> : <MainLayout />}
    </AppProvider>
  );
}

export default memo(AuthLayout);
