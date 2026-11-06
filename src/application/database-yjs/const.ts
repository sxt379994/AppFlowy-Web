import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';

import { RowMetaKey } from '@/application/database-yjs/database.type';
import { RowId, YDatabaseRow, YDoc, YjsDatabaseKey, YjsEditorKey } from '@/application/types';
import { parseAppFlowyObjectId } from '@/utils/appflowy-object-id';

export const DEFAULT_ROW_HEIGHT = 36;
export const MIN_COLUMN_WIDTH = 150;
export const PADDING_END = 220;
export const DEFAULT_FIELD_WRAP = false;

export const getCell = (rowId: string, fieldId: string, rowMetas: Record<RowId, YDoc>) => {
  const rowMeta = rowMetas[rowId];

  const meta = rowMeta?.getMap(YjsEditorKey.data_section).get(YjsEditorKey.database_row) as YDatabaseRow;

  return meta?.get(YjsDatabaseKey.cells)?.get(fieldId);
};

export const getCellData = (rowId: string, fieldId: string, rowMetas: Record<RowId, YDoc>) => {
  return getCell(rowId, fieldId, rowMetas)?.get(YjsDatabaseKey.data);
};

export const metaIdFromRowId = (rowId: string) => {
  const namespace = parseAppFlowyObjectId(rowId);

  return (key: RowMetaKey) => uuidv5(key, namespace).toString();
};

export const generateUUID = () => uuidv4();
