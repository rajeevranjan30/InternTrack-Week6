const store = {};
const elements = {};
global.localStorage = {
  getItem: key => Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
  setItem: (key, value) => { store[key] = String(value); },
  removeItem: key => { delete store[key]; }
};
global.document = {
  addEventListener: jest.fn(),
  getElementById: id => elements[id] || null
};

const { getToken, getUser, setSession, clearSession, escapeHtml, updateProgressUI } = require('../../../js/app.js');

describe('frontend helper unit tests', () => {
  beforeEach(() => {
    Object.keys(store).forEach(k => delete store[k]);
    Object.keys(elements).forEach(k => delete elements[k]);
  });

  test('stores and retrieves the authenticated session', () => {
    setSession({ token: 'abc', user: { name: 'Alex' } });
    expect(getToken()).toBe('abc');
    expect(getUser()).toEqual({ name: 'Alex' });
    clearSession();
    expect(getToken()).toBeNull();
    expect(getUser()).toBeNull();
  });

  test('escapeHtml prevents HTML injection characters', () => {
    expect(escapeHtml(`<img src=x onerror='bad'> & "x"`)).toBe('&lt;img src=x onerror=&#39;bad&#39;&gt; &amp; &quot;x&quot;');
  });

  test('updateProgressUI clamps values to 0–100', () => {
    elements.progressBar = { style: {} };
    elements.progressValue = { textContent: '' };
    updateProgressUI(140);
    expect(elements.progressBar.style.width).toBe('100%');
    expect(elements.progressValue.textContent).toBe('100%');
    updateProgressUI(-20);
    expect(elements.progressBar.style.width).toBe('0%');
    expect(elements.progressValue.textContent).toBe('0%');
  });
});
