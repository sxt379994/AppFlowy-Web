import { parse, stringify, v5, validate } from 'uuid';

import { metaIdFromRowId } from '@/application/database-yjs/const';
import { RowMetaKey } from '@/application/database-yjs/database.type';
import { isAppFlowyObjectId, parseAppFlowyObjectId, stringifyAppFlowyObjectId } from '../appflowy-object-id';

const API_ROW = 'fdeff667-1ef3-1a2a-d01b-e4dfd9b5ceda';
const UUID_ROW = '7bfad25e-2ba1-4d61-8ee2-4c61099df01a';

describe('AppFlowy raw object IDs', () => {
  it('preserves every bit of API hash-derived IDs rejected by RFC UUID validation', () => {
    expect(validate(API_ROW)).toBe(false);
    expect(isAppFlowyObjectId(API_ROW)).toBe(true);
    expect(stringifyAppFlowyObjectId(parseAppFlowyObjectId(API_ROW))).toBe(API_ROW);
    expect(stringifyAppFlowyObjectId(parseAppFlowyObjectId(API_ROW.toUpperCase()))).toBe(API_ROW);
  });

  it('is byte-for-byte compatible with existing RFC UUID records', () => {
    expect(parseAppFlowyObjectId(UUID_ROW)).toEqual(parse(UUID_ROW));
    expect(stringifyAppFlowyObjectId(parse(UUID_ROW))).toBe(stringify(parse(UUID_ROW)));
    for (const key of Object.values(RowMetaKey)) {
      expect(metaIdFromRowId(UUID_ROW)(key)).toBe(v5(key, UUID_ROW));
    }
  });

  it('derives stable metadata matching an independent UUIDv5 implementation', () => {
    // Python uuid.uuid5(UUID(API_ROW), key); same raw-byte namespace as Rust.
    const expected = {
      document_id: '813f0adc-f035-551d-a944-164fba87e59b',
      icon_id: 'd9b78a05-de68-567d-96e2-3af11bbfde16',
      cover_id: 'd8eb0c42-7855-5d74-a173-0f8f4886b650',
      is_document_empty: '92557898-0f94-5617-b78c-9fc09e4ce3ec',
    };

    for (let attempt = 0; attempt < 3; attempt++) {
      for (const key of Object.values(RowMetaKey)) {
        expect(metaIdFromRowId(API_ROW)(key)).toBe(expected[key]);
      }
    }
  });

  it.each(['', 'row-1', API_ROW + '/x', ' ' + API_ROW, API_ROW + '\n', API_ROW.replace(/-/g, ''), API_ROW.replace('f', 'z')])(
    'rejects malformed IDs instead of inventing a random document namespace: %s',
    (value) => {
      expect(isAppFlowyObjectId(value)).toBe(false);
      expect(() => parseAppFlowyObjectId(value)).toThrow(TypeError);
      expect(() => metaIdFromRowId(value)).toThrow(TypeError);
    }
  );

  it.each([0, 15, 17])('rejects invalid byte length %d', (length) => {
    expect(() => stringifyAppFlowyObjectId(new Uint8Array(length))).toThrow(TypeError);
  });
});
