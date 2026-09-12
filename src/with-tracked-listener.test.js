import withTrackedListener from './with-tracked-listener.js';

import assert from 'node:assert';
import test, { describe, mock } from 'node:test';

// note: test behaviour not implementation

describe('with-tracked-listener.test.js', () => {
	test('create new tracked event target', () => {
		class TrackedEventTarget extends withTrackedListener(EventTarget) {
			foo() { }
		}

		const trackedEventTarget = new TrackedEventTarget();

		assert.strictEqual(typeof trackedEventTarget.canDispatch, 'function');
		assert.strictEqual(typeof trackedEventTarget.foo, 'function');
	});

	test('add event listener', () => {
		const listener = mock.fn();
		const event = new CustomEvent('change', {});

		class TrackedEventTarget extends withTrackedListener(EventTarget) { }

		const trackedEventTarget = new TrackedEventTarget();
		trackedEventTarget.addEventListener('change', listener);
		trackedEventTarget.dispatchEvent(event);

		assert.strictEqual(trackedEventTarget.canDispatch('change'), true);
		assert.strictEqual(listener.mock.calls.length, 1);
	});

	test('remove event listener', () => {
		const listener = () => void 0;

		class TrackedEventTarget extends withTrackedListener(EventTarget) { }

		const trackedEventTarget = new TrackedEventTarget();
		trackedEventTarget.addEventListener('change', listener);
		trackedEventTarget.removeEventListener('change', listener);

		assert.strictEqual(trackedEventTarget.canDispatch('change'), false);
	});
});


