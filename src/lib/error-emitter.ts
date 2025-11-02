
import { EventEmitter } from 'events';

// It's important to use a single instance of the emitter throughout the app
// to ensure that events are correctly broadcast and listened for.
class AppEventEmitter extends EventEmitter {}

export const errorEmitter = new AppEventEmitter();
