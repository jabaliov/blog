/* Works on file:// and GitHub Pages; no network, dependencies or storage needed. */
(() => {
  const controls = Object.fromEntries(['search', 'platform', 'category', 'year'].map(id => [id, document.getElementById(id)]));
  const cards = [...document.querySelectorAll('.card')].map(node => ({node, platform: node.dataset.platform, year: node.dataset.year, categories: JSON.parse(node.dataset.categories), search: normalize(node.dataset.search)}));
  const count = document.getElementById('count');
  const empty = document.getElementById('empty');
  function normalize(value) {
    return value.toLowerCase().normalize('NFKD').replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي');
  }
  function readHash() {
    const params = new URLSearchParams(location.hash.slice(1));
    for (const [id, input] of Object.entries(controls)) {
      const value = params.get(id) || '';
      input.value = id === 'search' || [...input.options].some(option => option.value === value) ? value : '';
    }
  }
  function apply(updateHash = true) {
    const terms = normalize(controls.search.value.trim()).split(/\s+/).filter(Boolean);
    let found = 0;
    for (const card of cards) {
      const visible = (!controls.platform.value || controls.platform.value === card.platform)
        && (!controls.category.value || card.categories.includes(controls.category.value))
        && (!controls.year.value || controls.year.value === card.year)
        && terms.every(term => card.search.includes(term));
      card.node.hidden = !visible;
      if (visible) found++;
    }
    count.textContent = `عرض ${found} من ${cards.length} مادة`;
    empty.hidden = found !== 0;
    if (updateHash) {
      const params = new URLSearchParams();
      for (const [id, input] of Object.entries(controls)) if (input.value) params.set(id, input.value);
      const hash = params.toString();
      try { history.replaceState(null, '', location.pathname + location.search + (hash ? '#' + hash : '')); }
      catch { /* Filtering still works in viewers that restrict file URL history. */ }
    }
  }
  for (const input of Object.values(controls)) input.addEventListener(input.tagName === 'SELECT' ? 'change' : 'input', () => apply());
  document.getElementById('filters').addEventListener('submit', event => event.preventDefault());
  document.getElementById('filters').addEventListener('reset', event => {
    event.preventDefault();
    for (const input of Object.values(controls)) input.value = '';
    apply();
  });
  document.querySelector('#entries').addEventListener('click', event => {
    const tag = event.target.closest('a.tag');
    if (!tag || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    controls.category.value = new URL(tag.href).hash ? new URLSearchParams(new URL(tag.href).hash.slice(1)).get('category') : '';
    apply();
    controls.category.focus();
  });
  window.addEventListener('hashchange', () => {readHash(); apply(false);});
  readHash();
  apply(false);
})();
