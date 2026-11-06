import { useMemo } from 'react';

import { FieldType, isAIFieldType, useDatabaseContext, useReadOnly } from '@/application/database-yjs';
import { FieldVisibility } from '@/application/database-yjs/database.type';
import { useFieldsSelector } from '@/application/database-yjs/selector';
import { FieldId } from '@/application/types';
import { useAIEnabled } from '@/components/app/app.hooks';
import { useCompactLayout, useViewportWidth } from '@/utils/use-compact-layout';

export enum GridColumnType {
  Field,
  NewProperty,
}

export type RenderColumn = {
  type: GridColumnType;
  visibility?: FieldVisibility;
  fieldId?: FieldId;
  fieldType?: FieldType;
  width: number;
  wrap?: boolean;
  isPrimary?: boolean;
  isCompact?: boolean;
};

export function getGridRenderColumns({
  aiEnabled,
  fields,
  isMobile,
  mobileViewportWidth,
  readOnly,
  mobilePadding = 42,
}: {
  aiEnabled: boolean;
  fields: Omit<RenderColumn, 'type'>[];
  isMobile: boolean;
  mobileViewportWidth: number;
  readOnly: boolean;
  mobilePadding?: number;
}): RenderColumn[] {
  const visibleFields: RenderColumn[] = fields
    .filter((column) => aiEnabled || !isAIFieldType(column.fieldType))
    .map((column) => ({
      ...column,
      type: GridColumnType.Field,
    }));

  if (isMobile) {
    // A full desktop grid is difficult to scan or edit at phone width. Keep
    // the primary/title field in the grid and use the existing row-detail
    // screen for the complete editable record.
    const primaryField = visibleFields.find((column) => column.isPrimary) ?? visibleFields[0];

    return primaryField ? [{ ...primaryField, isCompact: true, width: Math.max(0, mobileViewportWidth - mobilePadding) }] : [];
  }

  if (!readOnly) {
    visibleFields.push({
      type: GridColumnType.NewProperty,
      width: 150,
    });
  }

  return visibleFields;
}

export function useRenderFields(containerWidth?: number) {
  const fields = useFieldsSelector();
  const aiEnabled = useAIEnabled();
  const readOnly = useReadOnly();
  const compact = useCompactLayout();
  const viewportWidth = useViewportWidth();
  const { paddingStart, paddingEnd } = useDatabaseContext();
  const isMobile = compact || (containerWidth !== undefined && containerWidth < 768);
  const mobileViewportWidth = containerWidth ?? viewportWidth;
  const mobilePadding = (paddingStart ?? 16) + (paddingEnd ?? 16);
  const renderColumns = useMemo(
    () => getGridRenderColumns({ aiEnabled, fields, isMobile, mobileViewportWidth, mobilePadding, readOnly }),
    [aiEnabled, fields, isMobile, mobileViewportWidth, mobilePadding, readOnly]
  );

  return {
    fields: renderColumns,
  };
}
