import { domAnimation } from 'framer-motion';

/**
 * framer-motion bundle loaded lazily by the MotionProvider.
 * domAnimation covers animations, variants, exit animations and
 * gestures. Drag and layout animations are not included,
 * the only drag consumers bundle their own runtime and are page-scoped.
 */
export default domAnimation;
