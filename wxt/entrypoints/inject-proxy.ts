import {defineUnlistedScript} from 'wxt/utils/define-unlisted-script';

import '../../src/inject/dynamic-theme/mv3-proxy';

export default defineUnlistedScript({include: ['chrome', 'edge'], main() {}});
