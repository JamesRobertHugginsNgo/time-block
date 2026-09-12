import withTrackedListener from './with-tracked-listener.js';

const TrackedEventTarget = withTrackedListener(EventTarget);
export default TrackedEventTarget;
