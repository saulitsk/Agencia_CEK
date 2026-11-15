/**
 * ui-shared.js
 * Componentes e comportamentos compartilhados em todas as páginas:
 * 1. Botão flutuante fixo do WhatsApp no celular
 * 2. Aviso de Cookies (LGPD) com persistência em localStorage
 * 3. Animações de carregamento (skeleton/spinner para mapa e imagens lazy)
 */

const WHATSAPP_URL_PADRAO =
  'https://wa.me/5511954047211?text=Ol%C3%A1%2C%20estou%20no%20site%20da%20Ag%C3%AAncia%20C%26K%20e%20gostaria%20de%20comprar%20uma%20passagem.';
const COOKIE_STORAGE_KEY = 'cek_cookie_consent';

export function initSharedUI() {
  initLoadingStates();
  initMobileWhatsappFloat();
  initCookieBanner();
}

/**
 * 1. Estados e animações de carregamento para iframes (Google Maps) e imagens
 */
function initLoadingStates() {
  // Mapa (iframe) — exibe loader até o evento load disparar
  const mapIframes = document.querySelectorAll('iframe[src*="maps.google"]');
  mapIframes.forEach((iframe) => {
    const parent = iframe.parentElement;
    if (!parent) return;

    parent.classList.add('relative');

    const loader = document.createElement('div');
    loader.className =
      'map-loader absolute inset-0 z-10 flex flex-col items-center justify-center bg-surface-container text-deep-navy transition-opacity duration-500';
    loader.setAttribute('aria-hidden', 'true');
    loader.innerHTML = `
      <div class="relative flex items-center justify-center mb-3">
        <span class="w-12 h-12 rounded-full border-2 border-vibrant-gold/30 border-t-vibrant-gold animate-spin"></span>
        <span class="material-symbols-outlined text-deep-navy text-[20px] absolute" style="font-variation-settings: 'FILL' 1;">location_on</span>
      </div>
      <span class="font-label-caps text-[11px] uppercase tracking-widest text-deep-navy/70">Carregando mapa…</span>
    `;
    parent.insertBefore(loader, iframe);

    const hideLoader = () => {
      loader.classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => loader.remove(), 550);
    };

    iframe.addEventListener('load', hideLoader, { once: true });
    // Fallback de segurança caso o navegador atrase o evento load do iframe
    setTimeout(hideLoader, 6000);
  });

  // Imagens com loading="lazy" — efeito suave de skeleton/fade ao carregar
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  lazyImages.forEach((img) => {
    const container = img.parentElement;
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add('img-loaded');
      return;
    }

    img.classList.add('img-loading');
    if (container) {
      container.classList.add('skeleton-shimmer');
    }

    const onDone = () => {
      img.classList.remove('img-loading');
      img.classList.add('img-loaded');
      container?.classList.remove('skeleton-shimmer');
    };

    img.addEventListener('load', onDone, { once: true });
    img.addEventListener('error', onDone, { once: true });
  });
}

/**
 * 2. Botão fixo flutuante de WhatsApp exclusivo para layout mobile/tablet (< 1100px)
 */
function initMobileWhatsappFloat() {
  if (document.getElementById('whatsapp-mobile-float')) return;

  const btn = document.createElement('a');
  btn.id = 'whatsapp-mobile-float';
  btn.href = WHATSAPP_URL_PADRAO;
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
  btn.setAttribute('aria-label', 'Falar com a Agência C&K pelo WhatsApp');
  btn.className =
    'whatsapp-float fixed bottom-5 right-5 z-40 nav:hidden flex items-center gap-2 bg-vibrant-gold text-deep-navy px-4 py-3 rounded-full font-headline-md font-bold text-[13px] tracking-tight border border-deep-navy/20 shadow-[0px_4px_0px_0px_#12205C] active:translate-y-0.5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pure-white';

  btn.innerHTML = `
    <span class="relative flex h-2.5 w-2.5 mr-0.5" aria-hidden="true">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-deep-navy opacity-40"></span>
      <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-deep-navy"></span>
    </span>
    <span class="material-symbols-outlined text-[20px] leading-none" style="font-variation-settings: 'FILL' 1;" aria-hidden="true">chat</span>
    <span>WhatsApp</span>
  `;

  document.body.appendChild(btn);

  // Ocultar o botão flutuante quando o menu mobile tela cheia estiver aberto
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    const observer = new MutationObserver(() => {
      const isMenuOpen = mobileMenu.getAttribute('aria-hidden') === 'false';
      btn.classList.toggle('opacity-0', isMenuOpen);
      btn.classList.toggle('pointer-events-none', isMenuOpen);
    });
    observer.observe(mobileMenu, { attributes: true, attributeFilter: ['aria-hidden'] });
  }
}

/**
 * 3. Aviso de Cookies (LGPD)
 */
function initCookieBanner() {
  try {
    if (localStorage.getItem(COOKIE_STORAGE_KEY)) return;
  } catch {
    // Caso localStorage esteja bloqueado, segue sem quebrar
  }

  if (document.getElementById('cookie-consent-banner')) return;

  const banner = document.createElement('aside');
  banner.id = 'cookie-consent-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Aviso de uso de cookies e privacidade');
  banner.className =
    'cookie-banner fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 pointer-events-none transition-all duration-300 translate-y-full opacity-0';

  banner.innerHTML = `
    <div class="pointer-events-auto max-w-[1140px] mx-auto bg-deep-navy text-pure-white border border-vibrant-gold/30 rounded-xl p-4 sm:px-6 sm:py-4 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div class="flex items-start gap-3">
        <span class="material-symbols-outlined text-vibrant-gold text-[22px] shrink-0 mt-0.5" style="font-variation-settings: 'FILL' 1;" aria-hidden="true">cookie</span>
        <p class="font-body-md text-[13px] sm:text-[14px] text-surface-variant leading-relaxed">
          Utilizamos cookies essenciais e de análise para melhorar sua experiência de navegação em nosso site, em conformidade com a LGPD. Saiba mais em nossa
          <a href="privacidade.html" class="text-vibrant-gold font-bold underline underline-offset-2 hover:text-pure-white transition-colors">Política de Privacidade</a>.
        </p>
      </div>
      <div class="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
        <button type="button" id="cookie-btn-essential"
          class="flex-1 md:flex-initial px-3.5 py-2 rounded-lg border border-pure-white/30 text-pure-white font-body-md text-[12px] font-semibold hover:border-vibrant-gold hover:text-vibrant-gold transition-colors cursor-pointer">
          Apenas essenciais
        </button>
        <button type="button" id="cookie-btn-accept"
          class="flex-1 md:flex-initial px-4 py-2 rounded-lg bg-vibrant-gold text-deep-navy font-headline-md text-[13px] font-bold hover:-translate-y-0.5 transition-all cursor-pointer">
          Aceitar cookies
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(banner);
  document.body.classList.add('has-cookie-banner');

  // Anima a entrada suave após o carregamento inicial
  requestAnimationFrame(() => {
    setTimeout(() => {
      banner.classList.remove('translate-y-full', 'opacity-0');
    }, 300);
  });

  const saveConsent = (value) => {
    try {
      localStorage.setItem(
        COOKIE_STORAGE_KEY,
        JSON.stringify({ status: value, updatedAt: new Date().toISOString() })
      );
    } catch {
      // ignore storage errors
    }
    banner.classList.add('translate-y-full', 'opacity-0');
    document.body.classList.remove('has-cookie-banner');
    setTimeout(() => banner.remove(), 350);
  };

  banner.querySelector('#cookie-btn-accept')?.addEventListener('click', () => saveConsent('accepted'));
  banner.querySelector('#cookie-btn-essential')?.addEventListener('click', () => saveConsent('essential'));
}

