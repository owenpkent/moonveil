import {defineUnlistedScript} from 'wxt/utils/define-unlisted-script';

import '../../src/inject/color-scheme-watcher';

export default defineUnlistedScript({include: ['chrome', 'edge'], main() {}});
