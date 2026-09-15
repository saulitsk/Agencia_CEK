/**
 * busca-destinos.js
 * Lógica da página de busca de destinos (destinos.html).
 * — Autocomplete com busca normalizada (sem acentos)
 * — Fallback para destino fora do cadastro
 * — Data opcional
 * — Listagem completa agrupada por UF
 * — Redirecionamento para WhatsApp com mensagem dinâmica
 */

import {
  WHATSAPP_NUMERO,
  MENSAGEM_DESTINO_CADASTRADO,
  MENSAGEM_DESTINO_LIVRE,
  normalizar,
  buscarDestinos,
  agruparPorUF,
  NOMES_UF,
} from './destinos-data.js';

document.addEventListener('DOMContentLoaded', () => {
  const inputDestino = document.getElementById('destino-input');
  const listaSugestoes = document.getElementById('destino-suggestions');
  const inputData = document.getElementById('data-ida');
  const btnConsultar = document.getElementById('btn-ver-valores');
  const form = document.getElementById('busca-form');
  const listagemContainer = document.getElementById('listagem-destinos');

  if (!inputDestino || !listaSugestoes || !btnConsultar) return;

  // --- Definir data mínima como hoje ---
  if (inputData) {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = String(hoje.getMonth() + 1).padStart(2, '0');
    const diaAtual = String(hoje.getDate()).padStart(2, '0');
    inputData.min = `${anoAtual}-${mesAtual}-${diaAtual}`;
  }

  let selectedIndex = -1;
  /** @type {{ nome: string, uf: string } | null} */
  let destinoSelecionado = null;

  // --- Autocomplete ---
  function renderSugestoes(filtro) {
    const termo = filtro.trim();
    const termoNorm = normalizar(termo);
    listaSugestoes.innerHTML = '';
    selectedIndex = -1;

    if (termoNorm.length === 0) {
      listaSugestoes.classList.add('hidden');
      inputDestino.setAttribute('aria-expanded', 'false');
      return;
    }

    const resultados = buscarDestinos(termo);

    if (resultados.length === 0) {
      // Sem resultados — mostrar fallback
      const liMsg = document.createElement('li');
      liMsg.className = 'suggestion-item suggestion-empty';
      liMsg.setAttribute('role', 'option');
      liMsg.setAttribute('aria-disabled', 'true');
      liMsg.innerHTML = `<span class="material-symbols-outlined text-[16px] mr-2 opacity-50" aria-hidden="true">search_off</span>Não encontrou seu destino? Consulte nossa equipe pelo WhatsApp.`;
      listaSugestoes.appendChild(liMsg);

      // Botão "Consultar este destino"
      const liFallback = document.createElement('li');
      liFallback.className = 'suggestion-item suggestion-fallback';
      liFallback.setAttribute('role', 'option');
      liFallback.setAttribute('id', 'suggestion-fallback');
      liFallback.setAttribute('data-fallback', 'true');
      liFallback.innerHTML = `<span class="material-symbols-outlined text-[16px] mr-2 text-vibrant-gold" aria-hidden="true">chat</span>Consultar "<strong>${escapeHtml(termo)}</strong>"`;

      liFallback.addEventListener('mousedown', (e) => {
        e.preventDefault();
        consultarDestinoLivre(termo);
      });

      listaSugestoes.appendChild(liFallback);
      listaSugestoes.classList.remove('hidden');
      inputDestino.setAttribute('aria-expanded', 'true');
      return;
    }

    // Renderizar resultados
    resultados.forEach((destino, i) => {
      const li = document.createElement('li');
      li.className = 'suggestion-item';
      li.setAttribute('role', 'option');
      li.setAttribute('id', `suggestion-${i}`);
      li.setAttribute('data-nome', destino.nome);
      li.setAttribute('data-uf', destino.uf);

      // Highlight matching text (based on normalized comparison)
      const nomeNorm = normalizar(destino.nome);
      const idx = nomeNorm.indexOf(termoNorm);
      let nomeHtml;
      if (idx >= 0) {
        const before = destino.nome.slice(0, idx);
        const match = destino.nome.slice(idx, idx + termoNorm.length);
        const after = destino.nome.slice(idx + termoNorm.length);
        nomeHtml = `${escapeHtml(before)}<strong class="text-deep-navy">${escapeHtml(match)}</strong>${escapeHtml(after)}`;
      } else {
        nomeHtml = escapeHtml(destino.nome);
      }

      const detalheHtml = destino.detalhe
        ? `<span class="text-[11px] text-outline opacity-50 ml-1">(${escapeHtml(destino.detalhe)})</span>`
        : '';

      li.innerHTML = `<span class="material-symbols-outlined text-[16px] mr-2 text-vibrant-gold" aria-hidden="true">location_on</span>${nomeHtml}${detalheHtml}<span class="ml-auto text-[11px] text-outline opacity-60 pl-2 shrink-0">${destino.uf}</span>`;

      li.addEventListener('mousedown', (e) => {
        e.preventDefault();
        selecionarCidade(destino);
      });

      listaSugestoes.appendChild(li);
    });

    // Item extra: "Consultar [texto]" se o usuário quiser algo que não está na lista
    const liConsultar = document.createElement('li');
    liConsultar.className = 'suggestion-item suggestion-fallback';
    liConsultar.setAttribute('role', 'option');
    liConsultar.setAttribute('id', `suggestion-fallback`);
    liConsultar.setAttribute('data-fallback', 'true');
    liConsultar.innerHTML = `<span class="material-symbols-outlined text-[16px] mr-2 text-outline/50" aria-hidden="true">help_outline</span><span class="text-on-surface/60">Consultar "<strong>${escapeHtml(termo)}</strong>" mesmo assim</span>`;

    liConsultar.addEventListener('mousedown', (e) => {
      e.preventDefault();
      consultarDestinoLivre(termo);
    });

    listaSugestoes.appendChild(liConsultar);

    listaSugestoes.classList.remove('hidden');
    inputDestino.setAttribute('aria-expanded', 'true');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function selecionarCidade(destino) {
    inputDestino.value = `${destino.nome} — ${destino.uf}`;
    destinoSelecionado = { nome: destino.nome, uf: destino.uf };
    listaSugestoes.classList.add('hidden');
    listaSugestoes.innerHTML = '';
    inputDestino.setAttribute('aria-expanded', 'false');
    selectedIndex = -1;
    validarFormulario();
    if (inputData) inputData.focus();
  }

  function consultarDestinoLivre(texto) {
    const textoLimpo = texto.trim();
    if (textoLimpo.length === 0) return;

    let dataStr = 'a definir';
    if (inputData && inputData.value) {
      const [ano, mes, dia] = inputData.value.split('-');
      dataStr = `${dia}/${mes}/${ano}`;
    }

    const mensagem = MENSAGEM_DESTINO_LIVRE(textoLimpo, dataStr);
    const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  inputDestino.addEventListener('input', () => {
    // Se o usuário edita o campo, limpa a seleção anterior
    destinoSelecionado = null;
    renderSugestoes(inputDestino.value);
    validarFormulario();
  });

  inputDestino.addEventListener('focus', () => {
    if (inputDestino.value.trim().length > 0 && !destinoSelecionado) {
      renderSugestoes(inputDestino.value);
    }
  });

  inputDestino.addEventListener('blur', () => {
    setTimeout(() => {
      listaSugestoes.classList.add('hidden');
      inputDestino.setAttribute('aria-expanded', 'false');
    }, 200);
  });

  // Keyboard navigation
  inputDestino.addEventListener('keydown', (e) => {
    const items = listaSugestoes.querySelectorAll('.suggestion-item:not(.suggestion-empty)');
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      updateSelection(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      updateSelection(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) {
        const item = items[selectedIndex];
        if (item.dataset.fallback === 'true') {
          consultarDestinoLivre(inputDestino.value);
        } else {
          selecionarCidade({ nome: item.dataset.nome, uf: item.dataset.uf });
        }
      }
    } else if (e.key === 'Escape') {
      listaSugestoes.classList.add('hidden');
      inputDestino.setAttribute('aria-expanded', 'false');
      selectedIndex = -1;
    }
  });

  function updateSelection(items) {
    items.forEach((item, i) => {
      if (i === selectedIndex) {
        item.classList.add('is-selected');
        item.scrollIntoView({ block: 'nearest' });
        inputDestino.setAttribute('aria-activedescendant', item.id);
      } else {
        item.classList.remove('is-selected');
      }
    });
  }

  // --- Validação (destino obrigatório, data opcional) ---
  function validarFormulario() {
    const destinoPreenchido = destinoSelecionado !== null && inputDestino.value.trim().length > 0;
    btnConsultar.disabled = !destinoPreenchido;

    if (destinoPreenchido) {
      btnConsultar.classList.remove('opacity-50', 'cursor-not-allowed');
      btnConsultar.classList.add('hover:-translate-y-1', 'hover:shadow-[0px_4px_0px_0px_#12205C]');
    } else {
      btnConsultar.classList.add('opacity-50', 'cursor-not-allowed');
      btnConsultar.classList.remove('hover:-translate-y-1', 'hover:shadow-[0px_4px_0px_0px_#12205C]');
    }
  }

  if (inputData) {
    inputData.addEventListener('change', validarFormulario);
    inputData.addEventListener('input', validarFormulario);
  }

  // --- Submissão → WhatsApp ---
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (btnConsultar.disabled || !destinoSelecionado) return;

      let dataStr = 'a definir';
      if (inputData && inputData.value) {
        const [ano, mes, dia] = inputData.value.split('-');
        dataStr = `${dia}/${mes}/${ano}`;
      }

      const mensagem = MENSAGEM_DESTINO_CADASTRADO(destinoSelecionado.nome, destinoSelecionado.uf, dataStr);
      const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  // Pré-selecionar destino via URL parameter (ex: ?destino=Irecê)
  const urlParams = new URLSearchParams(window.location.search);
  const destinoParam = urlParams.get('destino');
  if (destinoParam) {
    const matches = buscarDestinos(destinoParam);
    if (matches.length > 0) {
      // Tenta encontrar correspondência exata primeiro (desconsiderando acentos)
      const termoNorm = normalizar(destinoParam);
      const exactMatch = matches.find(d => normalizar(d.nome) === termoNorm) || matches[0];
      selecionarCidade(exactMatch);
    } else {
      inputDestino.value = destinoParam;
      renderSugestoes(destinoParam);
    }
  }

  // Validar estado inicial
  validarFormulario();

  // --- Listagem completa de destinos ---
  if (listagemContainer) {
    renderListagem();
  }

  function renderListagem() {
    const grupos = agruparPorUF();
    let html = '';

    for (const [uf, destinos] of Object.entries(grupos)) {
      if (destinos.length === 0) continue;

      const nomeEstado = NOMES_UF[uf] || uf;
      const isPrimario = uf === 'BA';

      html += `
        <div class="listagem-uf-group ${isPrimario ? 'listagem-uf-primary' : ''} reveal-up">
          <h3 class="font-headline-md text-headline-md text-deep-navy mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-vibrant-gold" style="font-variation-settings: 'FILL' 1;" aria-hidden="true">location_on</span>
            ${nomeEstado}
            <span class="text-[13px] font-normal text-outline ml-1">(${destinos.length} ${destinos.length === 1 ? 'destino' : 'destinos'})</span>
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-2">
            ${destinos.map(d => {
              const detalheHtml = d.detalhe ? `<span class="block text-[11px] text-outline/60 leading-tight">${d.detalhe}</span>` : '';
              return `<div class="font-body-md text-body-md text-on-surface py-1.5">${d.nome}${detalheHtml}</div>`;
            }).join('')}
          </div>
        </div>
      `;
    }

    // "Não encontrou sua cidade?"
    html += `
      <div class="mt-10 p-6 bg-cream-canvas rounded-lg border border-vibrant-gold/20 text-center reveal-up">
        <p class="font-body-md text-body-md text-on-surface mb-3">
          <span class="material-symbols-outlined text-vibrant-gold align-middle mr-1" style="font-variation-settings: 'FILL' 1;" aria-hidden="true">help</span>
          <strong>Não encontrou sua cidade?</strong>
        </p>
        <p class="font-body-md text-[14px] text-on-surface/70 mb-4">
          Consulte nossa equipe — podemos verificar se atendemos o seu destino.
        </p>
        <a href="https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent('Olá! Gostaria de saber se vocês atendem um destino que não encontrei no site, saindo de São Paulo.')}"
           target="_blank" rel="noopener noreferrer"
           class="inline-flex items-center gap-2 bg-vibrant-gold text-deep-navy px-6 py-3 rounded-lg font-headline-md font-bold text-[14px] tracking-tight hover:-translate-y-1 hover:shadow-[0px_4px_0px_0px_#12205C] transition-all">
          <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;" aria-hidden="true">chat</span>
          Consultar pelo WhatsApp
        </a>
      </div>
    `;

    listagemContainer.innerHTML = html;

    // Re-observe reveal elements in the newly rendered content
    const revealEls = listagemContainer.querySelectorAll('.reveal-up');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      revealEls.forEach(el => el.classList.add('is-visible'));
    } else {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { root: null, threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
      revealEls.forEach(el => observer.observe(el));
    }
  }

  // --- Mobile Menu (duplicado para esta página secundária) ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuCloseBtn = document.getElementById('mobile-menu-close');

  if (mobileMenuBtn && mobileMenu) {
    const toggleMenu = (open) => {
      const isExpanded = open !== undefined ? open : mobileMenuBtn.getAttribute('aria-expanded') === 'false';
      mobileMenuBtn.setAttribute('aria-expanded', isExpanded);

      if (isExpanded) {
        mobileMenu.classList.remove('translate-x-full');
        mobileMenu.classList.add('translate-x-0');
        document.body.style.overflow = 'hidden';
        setTimeout(() => mobileMenuCloseBtn?.focus(), 300);
      } else {
        mobileMenu.classList.add('translate-x-full');
        mobileMenu.classList.remove('translate-x-0');
        document.body.style.overflow = '';
        mobileMenuBtn.focus();
      }
    };

    mobileMenuBtn.addEventListener('click', () => toggleMenu());
    mobileMenuCloseBtn?.addEventListener('click', () => toggleMenu(false));

    mobileMenu.querySelectorAll('a, button').forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenuBtn.getAttribute('aria-expanded') === 'true') {
        toggleMenu(false);
      }
    });
  }

  // --- Reveal animations ---
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealElements = document.querySelectorAll('.reveal-up');

  if (prefersReducedMotion) {
    revealElements.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { root: null, threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // Force-reveal hero elements
    setTimeout(() => {
      document.querySelectorAll('.search-hero .reveal-up').forEach(el => el.classList.add('is-visible'));
    }, 100);
  }
});
