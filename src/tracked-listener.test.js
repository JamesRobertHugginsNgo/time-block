import { addTrackedListener, hasTrackedListener, removeTrackedListener } from './tracked-listener.js';

import assert from 'node:assert';
import test, { describe, mock } from 'node:test';

// note: test behaviour not implementation

describe('tracked-listener.test.js', () => {
	test('add listener', () => {
		const target = new EventTarget();
		const listener = mock.fn();
		const event = new CustomEvent('change', {});

		addTrackedListener(target, 'change', listener);
		target.dispatchEvent(event);

		assert.ok(hasTrackedListener(target, 'change'));
		assert.strictEqual(listener.mock.calls.length, 1);
	});

	test('add once listener', () => {
		const target = new EventTarget();
		const listener = mock.fn();
		const event = new CustomEvent('change', {});

		addTrackedListener(target, 'change', listener, { once: true });
		target.dispatchEvent(event);

		assert.ok(!hasTrackedListener(target, 'change'));
		assert.strictEqual(listener.mock.calls.length, 1);
	});

	test('remove listener', () => {
		const target = new EventTarget();
		const listener = () => void 0;
		const event = new CustomEvent('change', {});

		addTrackedListener(target, 'change', listener);
		removeTrackedListener(target, 'change', listener);

		assert.ok(!hasTrackedListener(target, 'change'));
	});

		test('remove listener twice', () => {
		const target = new EventTarget();
		const listener = () => void 0;
		const event = new CustomEvent('change', {});

		addTrackedListener(target, 'change', listener);
		removeTrackedListener(target, 'change', listener);
		removeTrackedListener(target, 'change', listener);

		assert.ok(!hasTrackedListener(target, 'change'));
	});
});
