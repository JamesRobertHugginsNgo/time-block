import ListenerRegistry from './listener-registry.js';

import assert from 'node:assert';
import test, { describe } from 'node:test';

// note: test behaviour not implementation

describe('listener-registry.test.js', () => {
	test('add listener', () => {
		const registry = new ListenerRegistry();
		const listener = () => void 0;

		const result = registry.add('change', listener);

		assert.strictEqual(result, listener);
		assert.strictEqual(registry.has('change'), true);
		assert.strictEqual(registry.has('change', listener), true);
		assert.strictEqual(registry.has('change', listener, false), true);
		assert.strictEqual(!registry.has('change', listener, true), true);
	});

	test('add captured listener', () => {
		const registry = new ListenerRegistry();
		const listener = () => void 0;

		registry.add('change', listener, true);

		assert.strictEqual(registry.has('change', listener, false), false);
		assert.strictEqual(registry.has('change', listener, true), true);
	});

	test('add captured listener via options', () => {
		const registry = new ListenerRegistry();
		const listener = () => void 0;

		registry.add('change', listener, { capture: true });

		assert.strictEqual(registry.has('change', listener, { capture: false }), false);
		assert.strictEqual(registry.has('change', listener, { capture: true }), true);
	});

	test('delete listener', () => {
		const registry = new ListenerRegistry();
		const listener = () => void 0;

		registry.add('change', listener);
		registry.delete('change', listener);

		assert.strictEqual(registry.has('change'), false);
	});

	test('ignore listener deletion', () => {
		const registry = new ListenerRegistry();
		const listener = () => void 0;

		registry.delete('change', listener);

		assert.strictEqual(registry.has('change'), false);
	});

	test('add two listener and delete one', () => {
		const registry = new ListenerRegistry();
		const listener1 = () => void 0;
		const listener2 = () => void 0;

		registry.add('change', listener1);
		registry.add('change', listener2);
		registry.delete('change', listener1);

		assert.strictEqual(registry.has('change'), true);
	});

	test('add listener twice and delete it', () => {
		const registry = new ListenerRegistry();
		const listener = () => void 0;

		registry.add('change', listener);
		registry.add('change', listener);
		registry.delete('change', listener);

		assert.strictEqual(registry.has('change'), false);
	});

	test('add once listener and then call result listener', () => {
		const registry = new ListenerRegistry();
		const listener = () => void 0;

		const result = registry.add('change', listener, { once: true });
		result();

		assert.notStrictEqual(listener, result);
		assert.strictEqual(registry.has('change'), false);
	});

	test('add abortable listener and then abort', () => {
		const registry = new ListenerRegistry();
		const listener = () => void 0;
		const abortController = new AbortController();

		const result = registry.add('change', listener, { signal: abortController.signal });
		abortController.abort();

		assert.strictEqual(result, listener);
		assert.strictEqual(registry.has('change'), false);
	});

	test('add aborted listener', () => {
		const registry = new ListenerRegistry();
		const listener = () => void 0;
		const abortController = new AbortController();

		abortController.abort();
		const result = registry.add('change', listener, { signal: abortController.signal });

		assert.strictEqual(result, undefined);
		assert.strictEqual(registry.has('change'), false);
	});
});
