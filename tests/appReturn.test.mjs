// Run: npm test   (Node >= 22.6 strips the TypeScript types of the imported module)
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { parseAppReturnUrl, buildAppReturnLink } from '../services/appReturn.ts';

describe('parseAppReturnUrl: accepted app return URLs', () => {
  for (const ok of [
    'ecuforge://purchase-return',
    'ecuforge:///purchase-return',
    'exp://192.168.1.25:8081/--/purchase-return',
    'exp://10.0.0.7:8081/--/purchase-return',
    'exp://172.20.1.2:8081/--/purchase-return',
    'exp://localhost:8081/--/purchase-return',
    'exp://abc-anonymous-8081.exp.direct/--/purchase-return',
    'exps://abc-anonymous-8081.exp.direct/--/purchase-return',
  ]) {
    test(ok, () => assert.ok(parseAppReturnUrl(ok)));
  }
});

describe('parseAppReturnUrl: rejected (no open redirect)', () => {
  for (const bad of [
    null,
    '',
    'https://evil.example.com/purchase-return',
    'http://192.168.1.25/--/purchase-return',
    'javascript:alert(1)',
    'ecuforge://other-screen',
    'ecuforge://purchase-return/../admin',
    'exp://evil.example.com:8081/--/purchase-return',
    'exp://8.8.8.8:8081/--/purchase-return',
    'exp://192.168.1.25:8081/--/somewhere-else',
    'exp://user:pass@192.168.1.25:8081/--/purchase-return',
    'intent://purchase-return#Intent;scheme=ecuforge;end',
    'not a url',
    'ecuforge://purchase-return?' + 'x'.repeat(600),
  ]) {
    test(String(bad), () => assert.equal(parseAppReturnUrl(bad), null));
  }
});

describe('buildAppReturnLink', () => {
  test('adds only courseId and status, dropping any incoming query or hash', () => {
    const base = parseAppReturnUrl('exp://192.168.1.25:8081/--/purchase-return?token=SHOULD_NOT_SURVIVE#frag');
    const link = buildAppReturnLink(base, 'course_ecu_101', 'success');
    assert.equal(link, 'exp://192.168.1.25:8081/--/purchase-return?courseId=course_ecu_101&status=success');
  });

  test('works for the app scheme', () => {
    const link = buildAppReturnLink(parseAppReturnUrl('ecuforge://purchase-return'), 'abc', 'cancelled');
    assert.equal(link, 'ecuforge://purchase-return?courseId=abc&status=cancelled');
  });

  test('course id is URL-encoded', () => {
    const link = buildAppReturnLink(parseAppReturnUrl('ecuforge://purchase-return'), 'a&status=success', 'failed');
    const u = new URL(link);
    assert.equal(u.searchParams.get('courseId'), 'a&status=success');
    assert.equal(u.searchParams.get('status'), 'failed');
  });
});
