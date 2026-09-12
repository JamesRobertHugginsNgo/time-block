import ListenerRegistry from './listener-registry.js';

export default function withTrackedListener(BaseEventTarget) {
	return class extends BaseEventTarget {
		_listenerRegistry = new ListenerRegistry();

		addEventListener(type, listener, options) {
			const capturedListener = this._listenerRegistry.add(type, listener, options);
			super.addEventListener(type, capturedListener ?? listener, options);
		}

		removeEventListener(type, listener, options) {
			const capturedListener = this._listenerRegistry.delete(type, listener, options);
			super.removeEventListener(type, capturedListener ?? listener, options);
		}

		canDispatch(type) {
			return this._listenerRegistry.has(type);
		}
	}
}
