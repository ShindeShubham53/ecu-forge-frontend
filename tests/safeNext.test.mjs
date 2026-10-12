import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { safeNextPath } from '../services/safeNext.ts';

describe('safeNextPath (login ?next=)', () => {
  for (const ok of ['/delete-account', '/learn/course_ev_301', '/purchase/abc?return=x']) {
    test(`allows ${ok}`, () => assert.equal(safeNextPath(ok), ok));
  }
  for (const bad of [null, undefined, '', 'https://evil.example.com', '//evil.example.com', '/\\evil.example.com', 'javascript:alert(1)', 'delete-account', '/x\n', '/' + 'a'.repeat(250)]) {
    test(`rejects ${JSON.stringify(bad)}`, () => assert.equal(safeNextPath(bad), null));
  }
});
