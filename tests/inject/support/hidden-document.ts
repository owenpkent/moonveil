// Makes the document look hidden to the modules evaluated after this one,
// as if the content script ran in a background tab
Object.defineProperty(document, 'hidden', {configurable: true, get: () => true});

export function showDocument(): void {
    delete (document as any).hidden;
}
