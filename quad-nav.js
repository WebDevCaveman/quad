/* QUAD mobile nav toggle — hides the desktop link row under 900px and swaps in a burger + fullscreen overlay. */
(function () {
  if (customElements.get('quad-nav-toggle')) return;
  class QuadNavToggle extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      const light = (this.getAttribute('theme') || 'dark') === 'light';
      this.ink = light ? '#141118' : '#FAF7F2';
      this.bg = light ? '#F6EFE6' : '#141118';
      this.dim = light ? 'rgba(20,17,24,0.6)' : 'rgba(250,247,242,0.6)';
      this.focus = this.getAttribute('accent') || (light ? '#E2725B' : '#FFD600');
      const nav = this.closest('nav');
      this.linkRow = nav ? nav.querySelector('[data-navlinks]') : null;
      this.btn = document.createElement('button');
      this.btn.setAttribute('aria-label', 'menu');
      this.btn.setAttribute('aria-expanded', 'false');
      this.btn.style.cssText = 'appearance:none;border:none;cursor:pointer;background:transparent;display:none;align-items:center;justify-content:center;width:44px;height:44px;padding:0;border-radius:12px;';
      this.btn.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="' + this.ink + '" stroke-width="2.5" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="17" x2="20" y2="17"></line></svg>';
      this.btn.addEventListener('focus', () => { this.btn.style.outline = '3px solid ' + this.focus; this.btn.style.outlineOffset = '3px'; });
      this.btn.addEventListener('blur', () => { this.btn.style.outline = 'none'; });
      this.btn.addEventListener('click', () => this.open());
      this.appendChild(this.btn);
      this.mql = matchMedia('(max-width: 899px)');
      this.update = this.update.bind(this);
      this.mql.addEventListener('change', this.update);
      this.update();
    }
    disconnectedCallback() {
      if (this.mql) this.mql.removeEventListener('change', this.update);
      this.close();
    }
    update() {
      const m = this.mql.matches;
      if (this.linkRow) this.linkRow.style.display = m ? 'none' : 'flex';
      this.btn.style.display = m ? 'flex' : 'none';
      if (!m) this.close();
    }
    open() {
      if (this.overlay) return;
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const ov = document.createElement('div');
      ov.setAttribute('role', 'dialog');
      ov.setAttribute('aria-label', 'menu');
      ov.style.cssText = 'position:fixed;inset:0;z-index:999;background:' + this.bg + ';display:flex;flex-direction:column;padding:24px;box-sizing:border-box;opacity:' + (reduced ? '1' : '0') + ';transition:opacity .25s;overscroll-behavior:contain;overflow-y:auto;';
      const top = document.createElement('div');
      top.style.cssText = 'display:flex;align-items:center;justify-content:space-between;';
      const brand = document.createElement('span');
      brand.textContent = 'QUAD';
      brand.style.cssText = "font-family:'Clash Display',sans-serif;font-weight:700;font-size:26px;letter-spacing:-0.02em;color:" + this.ink + ';';
      const x = document.createElement('button');
      x.setAttribute('aria-label', 'close menu');
      x.style.cssText = 'appearance:none;border:none;cursor:pointer;background:transparent;width:44px;height:44px;display:flex;align-items:center;justify-content:center;padding:0;border-radius:12px;';
      x.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="' + this.ink + '" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"></line><line x1="19" y1="5" x2="5" y2="19"></line></svg>';
      x.addEventListener('click', () => this.close());
      top.appendChild(brand); top.appendChild(x);
      ov.appendChild(top);
      const list = document.createElement('div');
      list.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-top:40px;';
      const links = this.linkRow ? this.linkRow.querySelectorAll('a') : [];
      links.forEach((a, i) => {
        const isPill = i === links.length - 1;
        const n = document.createElement('a');
        n.href = a.getAttribute('href') || '#';
        n.textContent = a.textContent;
        if (isPill) {
          n.style.cssText = "display:inline-flex;align-self:flex-start;margin-top:28px;padding:16px 34px;border-radius:999px;background:" + this.ink + ';color:' + this.bg + ";font-family:'General Sans',sans-serif;font-size:18px;font-weight:600;text-decoration:none;";
        } else {
          n.style.cssText = "font-family:'Clash Display',sans-serif;font-weight:600;font-size:clamp(34px,9vw,48px);letter-spacing:-0.02em;line-height:1.25;color:" + this.ink + ';text-decoration:none;padding:6px 0;';
        }
        n.addEventListener('click', () => this.close());
        list.appendChild(n);
      });
      ov.appendChild(list);
      document.body.appendChild(ov);
      this.overlay = ov;
      this._esc = e => { if (e.key === 'Escape') this.close(); };
      addEventListener('keydown', this._esc);
      this._prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      this.btn.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(() => { ov.style.opacity = '1'; });
      x.focus();
    }
    close() {
      if (!this.overlay) return;
      this.overlay.remove(); this.overlay = null;
      removeEventListener('keydown', this._esc);
      document.body.style.overflow = this._prevOverflow || '';
      this.btn.setAttribute('aria-expanded', 'false');
      this.btn.focus();
    }
  }
  customElements.define('quad-nav-toggle', QuadNavToggle);
})();
