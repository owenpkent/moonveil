import '../support/polyfills';
import {showDocument} from '../support/hidden-document';
import {DEFAULT_THEME} from '../../../src/defaults';
import {createOrUpdateDynamicTheme, removeDynamicTheme} from '../../../src/inject/dynamic-theme';
import {multiline} from '../support/test-utils';

// The document is shown after the modules were evaluated
// but before the dynamic theme is applied, so no visibilitychange
// event reaches the visibility listener
showDocument();

const theme = {
    ...DEFAULT_THEME,
    darkSchemeBackgroundColor: 'black',
    darkSchemeTextColor: 'white',
};
let container: HTMLElement;

beforeEach(() => {
    container = document.body;
    container.innerHTML = '';
});

afterEach(() => {
    removeDynamicTheme();
    container.innerHTML = '';
});

describe('DOCUMENT VISIBILITY', () => {
    it('should override styles when document was shown before the theme was applied', () => {
        expect(document.hidden).toBe(false);
        container.innerHTML = multiline(
            '<style>',
            '    h1 strong { color: red; }',
            '</style>',
            '<h1>Style <strong>override</strong>!</h1>',
        );
        createOrUpdateDynamicTheme(theme, null, false);
        expect(container.querySelector('style.darkreader--sync')).not.toBeNull();
        expect(getComputedStyle(container.querySelector('h1 strong')!).color).toBe('rgb(255, 26, 26)');
    });
});
