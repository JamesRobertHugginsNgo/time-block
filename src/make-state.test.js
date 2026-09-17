import makeState, { BATCH_CHANGE_EVENT_TYPE, CHANGE_EVENT_TYPE, DELETE, eventTargetRegistry } from './make-state.js';

import assert from 'node:assert';
import test, { describe, mock } from 'node:test';

// note: test behaviour not implementation

describe('make-state.test.js', async () => {
	test('make state', () => {
		const [proxy, eventTarget] = makeState();

		assert.deepStrictEqual(proxy, {});
		assert.strictEqual(eventTarget instanceof EventTarget, true);
		assert.strictEqual(eventTargetRegistry.has(proxy), true);
		assert.strictEqual(eventTargetRegistry.get(proxy), eventTarget);
	});

	describe('object', async () => {
		test('make state', () => {
			const [proxy] = makeState({ name: 'Alice' });

			assert.deepStrictEqual(proxy, { name: 'Alice' });
		});

		test('change property', () => {
			const listener = mock.fn();
			const [proxy, eventTarget] = makeState({ name: 'Alice' });
			eventTarget.addEventListener('change', listener);

			proxy['name'] = 'Bob';

			assert.strictEqual(listener.mock.calls.length, 1);
			assert.deepStrictEqual(listener.mock.calls[0].arguments[0].detail.change, {
				target: { name: 'Bob' },
				property: 'name',
				oldValue: 'Alice',
				proxy: { name: 'Bob' },
				path: ['name'],
				keys: ['name'],
				dispatched: new Set([eventTarget])
			});
		});

		test('set property', () => {
			const listener = mock.fn();
			const [proxy, eventTarget] = makeState({});
			eventTarget.addEventListener('change', listener);

			proxy['name'] = 'Alice';

			assert.strictEqual(listener.mock.calls.length, 1);
			assert.deepStrictEqual(listener.mock.calls[0].arguments[0].detail.change, {
				target: { name: 'Alice' },
				property: 'name',
				oldValue: undefined,
				proxy: { name: 'Alice' },
				path: ['name'],
				keys: ['name'],
				dispatched: new Set([eventTarget])
			});
		});

		test('delete property', () => {
			const listener = mock.fn();
			const [proxy, eventTarget] = makeState({ name: 'Alice' });
			eventTarget.addEventListener('change', listener);

			delete proxy['name'];

			assert.strictEqual(listener.mock.calls.length, 1);
			assert.deepStrictEqual(listener.mock.calls[0].arguments[0].detail.change, {
				target: {},
				property: 'name',
				oldValue: 'Alice',
				proxy: {},
				path: ['name'],
				keys: ['name'],
				dispatched: new Set([eventTarget])
			});
		});
	});

	describe('object in object', async () => {
		test('make state', () => {
			const [addressProxy] = makeState({ city: 'Toronto' });
			const [proxy] = makeState({ name: 'Alice', address: addressProxy });

			assert.deepStrictEqual(proxy, { name: 'Alice', address: { city: 'Toronto' } });
		});

		test('change property', () => {
			const listener = mock.fn();
			const [addressProxy, addressEventTarget] = makeState({ city: 'Toronto' });
			const [proxy, eventTarget] = makeState({ name: 'Alice', address: addressProxy });
			eventTarget.addEventListener('change', listener);

			proxy['address']['city'] = 'Ottawa';

			assert.strictEqual(listener.mock.calls.length, 1);
			assert.deepStrictEqual(listener.mock.calls[0].arguments[0].detail.change, {
				target: { city: 'Ottawa' },
				property: 'city',
				oldValue: 'Toronto',
				proxy: { city: 'Ottawa' },
				path: [new Set(['address']), 'city'],
				keys: ['address.city'],
				dispatched: new Set([addressEventTarget, eventTarget])
			});
		});

		test('set property', () => {
			const listener = mock.fn();
			const [addressProxy, addressEventTarget] = makeState({});
			const [proxy, eventTarget] = makeState({ name: 'Alice', address: addressProxy });
			eventTarget.addEventListener('change', listener);

			proxy['address']['city'] = 'Toronto';

			assert.strictEqual(listener.mock.calls.length, 1);
			assert.deepStrictEqual(listener.mock.calls[0].arguments[0].detail.change, {
				target: { city: 'Toronto' },
				property: 'city',
				oldValue: undefined,
				proxy: { city: 'Toronto' },
				path: [new Set(['address']), 'city'],
				keys: ['address.city'],
				dispatched: new Set([addressEventTarget, eventTarget])
			});
		});

		test('delete property', () => {
			const listener = mock.fn();
			const [addressProxy, addressEventTarget] = makeState({ city: 'Toronto' });
			const [proxy, eventTarget] = makeState({ name: 'Alice', address: addressProxy });
			eventTarget.addEventListener('change', listener);

			delete proxy['address']['city'];

			assert.strictEqual(listener.mock.calls.length, 1);
			assert.deepStrictEqual(listener.mock.calls[0].arguments[0].detail.change, {
				target: {},
				property: 'city',
				oldValue: 'Toronto',
				proxy: {},
				path: [new Set(['address']), 'city'],
				keys: ['address.city'],
				dispatched: new Set([addressEventTarget, eventTarget])
			});
		});
	});

	describe('array', async () => {
		test('make state', () => {
			const [proxy] = makeState(['Alice']);

			assert.deepStrictEqual(proxy, ['Alice']);
		});

		test('change element', () => {
			const listener = mock.fn();
			const [proxy, eventTarget] = makeState(['Alice']);
			eventTarget.addEventListener('change', listener);

			proxy[0] = 'Bob';

			assert.strictEqual(listener.mock.calls.length, 1);
			assert.deepStrictEqual(listener.mock.calls[0].arguments[0].detail.change, {
				target: ['Bob'],
				property: '0',
				oldValue: 'Alice',
				proxy: ['Bob'],
				path: ['0'],
				keys: ['0'],
				dispatched: new Set([eventTarget])
			});
		});

		test('push element', () => {
			const listener = mock.fn();
			const [proxy, eventTarget] = makeState([]);
			eventTarget.addEventListener('change', listener);

			proxy.push('Alice');

			assert.strictEqual(listener.mock.calls.length, 1);
			assert.deepStrictEqual(listener.mock.calls[0].arguments[0].detail.change, {
				target: ['Alice'],
				property: '0',
				oldValue: undefined,
				proxy: ['Alice'],
				path: ['0'],
				keys: ['0'],
				dispatched: new Set([eventTarget])
			});
		});

		test('pop element', () => {
			const listener = mock.fn();
			const [proxy, eventTarget] = makeState(['Alice']);
			eventTarget.addEventListener('change', listener);

			const result = proxy.pop();

			assert.strictEqual(result, 'Alice');
			assert.strictEqual(listener.mock.calls.length, 2); // quirk of array proxy is length changes on pop
			assert.deepStrictEqual(listener.mock.calls[0].arguments[0].detail.change, {
				target: [],
				property: '0',
				oldValue: 'Alice',
				proxy: [],
				path: ['0'],
				keys: ['0'],
				dispatched: new Set([eventTarget])
			});
			// quirk of array proxy is length change is unreliable
			assert.deepStrictEqual(listener.mock.calls[1].arguments[0].detail.change, {
				target: [],
				property: 'length',
				oldValue: 1,
				proxy: [],
				path: ['length'],
				keys: ['length'],
				dispatched: new Set([eventTarget])
			});
		});
	});

	describe('array in array', async () => {
		test('make state', () => {
			const [addressProxy] = makeState(['Toronto']);
			const [proxy] = makeState(['Alice', addressProxy]);

			assert.deepStrictEqual(proxy, ['Alice', ['Toronto']]);
		});

		test('change element', () => {
			const listener = mock.fn();
			const [addressProxy, addressEventTarget] = makeState(['Toronto']);
			const [proxy, eventTarget] = makeState(['Alice', addressProxy]);
			eventTarget.addEventListener('change', listener);

			proxy[1][0] = 'Ottawa';

			assert.strictEqual(listener.mock.calls.length, 1);
			assert.deepStrictEqual(listener.mock.calls[0].arguments[0].detail.change, {
				target: ['Ottawa'],
				property: '0',
				oldValue: 'Toronto',
				proxy: ['Ottawa'],
				path: [new Set(['1']), '0'],
				keys: ['1.0'],
				dispatched: new Set([addressEventTarget, eventTarget])
			});
		});

		test('push element', () => {
			const listener = mock.fn();
			const [addressProxy, addressEventTarget] = makeState([]);
			const [proxy, eventTarget] = makeState(['Alice', addressProxy]);
			eventTarget.addEventListener('change', listener);

			proxy[1].push('Toronto');

			assert.strictEqual(listener.mock.calls.length, 1);
			assert.deepStrictEqual(listener.mock.calls[0].arguments[0].detail.change, {
				target: ['Toronto'],
				property: '0',
				oldValue: undefined,
				proxy: ['Toronto'],
				path: [new Set(['1']), '0'],
				keys: ['1.0'],
				dispatched: new Set([addressEventTarget, eventTarget])
			});
		});

		test('pop element', () => {
			const listener = mock.fn();
			const [addressProxy, addressEventTarget] = makeState(['Toronto']);
			const [proxy, eventTarget] = makeState(['Alice', addressProxy]);
			eventTarget.addEventListener('change', listener);

			const result = proxy[1].pop();

			assert.strictEqual(result, 'Toronto');
			assert.strictEqual(listener.mock.calls.length, 2); // quirk of array proxy is length changes on pop
			assert.deepStrictEqual(listener.mock.calls[0].arguments[0].detail.change, {
				target: [],
				property: '0',
				oldValue: 'Toronto',
				proxy: [],
				path: [new Set(['1']), '0'],
				keys: ['1.0'],
				dispatched: new Set([addressEventTarget, eventTarget])
			});
			// quirk of array proxy is length change is unreliable
			console.log(listener.mock.calls[1].arguments[0].detail.change);
			assert.deepStrictEqual(listener.mock.calls[1].arguments[0].detail.change, {
				target: [],
				property: 'length',
				oldValue: 1,
				proxy: [],
				path: [new Set(['1']), 'length'],
				keys: ['1.length'],
				dispatched: new Set([addressEventTarget, eventTarget])
			});
		});
	});
});
