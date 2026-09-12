import ListenerRegistry from './listener-registry.js';

export const listenerRegistryMap = new WeakMap();

export function addTrackedListener(target, type, listener, options) {
	if (!listenerRegistryMap.has(target)) {
		listenerRegistryMap.set(target, new ListenerRegistry());
	}
	const listenerRegistry = listenerRegistryMap.get(target);
	const capturedListener = listenerRegistry.add(type, listener, options);
	target.addEventListener(type, capturedListener ?? listener, options);
}

export function removeTrackedListener(target, type, listener, options) {
	let capturedListener;
	if (listenerRegistryMap.has(target)) {
		const listenerRegistry = listenerRegistryMap.get(target);
		capturedListener = listenerRegistry.delete(type, listener, options);
	}
	target.removeEventListener(type, capturedListener ?? listener, options);
}

export function hasTrackedListener(target, type, listener, options) {
	if (!listenerRegistryMap.has(target)) {
		return false;
	}
	const listenerRegistry = listenerRegistryMap.get(target);
	return listenerRegistry.has(type, listener, options);
}
