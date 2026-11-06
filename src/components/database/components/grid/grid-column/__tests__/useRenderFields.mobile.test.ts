import { FieldType } from '@/application/database-yjs';
import {
  getGridRenderColumns,
  GridColumnType,
  type RenderColumn,
} from '@/components/database/components/grid/grid-column/useRenderFields';

const fields: Omit<RenderColumn, 'type'>[] = [
  {
    fieldId: 'status',
    fieldType: FieldType.SingleSelect,
    width: 140,
  },
  {
    fieldId: 'name',
    fieldType: FieldType.RichText,
    isPrimary: true,
    width: 220,
  },
  {
    fieldId: 'priority',
    fieldType: FieldType.SingleSelect,
    width: 120,
  },
];

describe('getGridRenderColumns mobile presentation', () => {
  it('renders the primary title as a phone-width row and omits desktop property controls', () => {
    expect(
      getGridRenderColumns({
        aiEnabled: true,
        fields,
        isMobile: true,
        mobileViewportWidth: 390,
        readOnly: false,
      })
    ).toEqual([
      expect.objectContaining({
        fieldId: 'name',
        isPrimary: true,
        type: GridColumnType.Field,
        width: 348,
      }),
    ]);
  });

  it('preserves the complete editable grid on desktop', () => {
    const columns = getGridRenderColumns({
      aiEnabled: true,
      fields,
      isMobile: false,
      mobileViewportWidth: 390,
      readOnly: false,
    });

    expect(columns.map((column) => column.fieldId)).toEqual(['status', 'name', 'priority', undefined]);
    expect(columns.at(-1)).toEqual({ type: GridColumnType.NewProperty, width: 150 });
  });

  it('falls back to the first visible field when imported data has no primary marker', () => {
    const columns = getGridRenderColumns({
      aiEnabled: true,
      fields: fields.map((field) => ({ ...field, isPrimary: false })),
      isMobile: true,
      mobileViewportWidth: 320,
      readOnly: true,
    });

    expect(columns).toHaveLength(1);
    expect(columns[0].fieldId).toBe('status');
    expect(columns[0].width).toBe(278);
  });
});
