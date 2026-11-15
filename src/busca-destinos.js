/**
 * busca-destinos.js
 * Lógica da página de busca de destinos (destinos.html).
 * — Autocomplete com busca normalizada (sem acentos)
 * — Seleção por teclado: setas, Enter (exata ou destacada), Escape
 * — Fallback para destino fora do cadastro
 * — Data opcional com validação de data passada
 * — Listagem interativa agrupada por UF (clique → preenche formulário)
 * — Filtro inline da listagem
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
  DESTINOS,
} from './destinos-data.js';
import { initCalendario } from './calendario.js';
import { initSharedUI } from './ui-shared.js';

document.addEventListener('DOMContentLoaded', () => {
  initSharedUI();

  const inputDestino = document.getElementById('destino-input');
  const listaSugestoes = document.getElementById('destino-suggestions');
  const inputData = document.getElementById('data-ida');
  const inputDataDisplay = document.getElementById('data-ida-display');
  const btnConsultar = document.getElementById('btn-ver-valores');
  const btnConsultarText = document.getElementById('btn-ver-valores-text');
  const btnConsultarIcon = document.getElementById('btn-ver-valores-icon');
  const form = document.getElementById('busca-form');
  const listagemContainer = document.getElementById('listagem-destinos');

  if (!inputDestino || !listaSugestoes || !btnConsultar) return;

  // --- Inicializar calendário customizado ---
  const calendario = initCalendario(validarFormulario);

  // --- Elemento de erro para destino ---
  let destinoErroEl = null;
  const containerDestino = document.getElementById('campo-destino-grupo') || inputDestino.parentElement?.parentElement;
  if (containerDestino) {
    destinoErroEl = document.createElement('p');
    destinoErroEl.className = 'font-body-md text-[13px] text-error mt-1.5 hidden flex items-center gap-1';
    destinoErroEl.setAttribute('role', 'alert');
    destinoErroEl.id = 'destino-erro';
    containerDestino.appendChild(destinoErroEl);
    inputDestino.setAttribute('aria-describedby', 'destino-erro');
  }

  function mostrarErroDestino(mensagem) {
    if (destinoErroEl) {
      destinoErroEl.innerHTML = `<span class="material-symbols-outlined text-[15px] shrink-0" aria-hidden="true">error</span><span>${escapeHtml(mensagem)}</span>`;
      destinoErroEl.classList.remove('hidden');
    }
    inputDestino.classList.add('border-error');
    inputDestino.setAttribute('aria-invalid', 'true');
  }

  function limparErroDestino() {
    if (destinoErroEl) {
      destinoErroEl.textContent = '';
      destinoErroEl.classList.add('hidden');
    }
    inputDestino.classList.remove('border-error');
    inputDestino.removeAttribute('aria-invalid');
  }

  // --- Feedback de carregamento no botão ao abrir WhatsApp ---
  function animarBotaoEnvio() {
    if (!btnConsultarText || !btnConsultarIcon) return;
    const textoOriginal = btnConsultarText.textContent;
    const iconeOriginal = btnConsultarIcon.textContent;
    btnConsultarText.textContent = 'Abrindo WhatsApp…';
    btnConsultarIcon.textContent = 'progress_activity';
    btnConsultarIcon.classList.add('animate-spin');
    setTimeout(() => {
      btnConsultarText.textContent = textoOriginal;
      btnConsultarIcon.textContent = iconeOriginal;
      btnConsultarIcon.classList.remove('animate-spin');
    }, 1400);
  }

  // --- Elemento de erro para data ---
  let dataErroEl = null;
  const containerData = document.getElementById('campo-data-grupo') || inputData?.parentElement;
  if (containerData) {
    dataErroEl = document.createElement('p');
    dataErroEl.className = 'font-body-md text-[13px] text-error mt-1 hidden';
    dataErroEl.setAttribute('role', 'alert');
    dataErroEl.id = 'data-ida-erro';
    containerData.appendChild(dataErroEl);
    inputData?.setAttribute('aria-describedby', 'data-ida-erro');
    inputDataDisplay?.setAttribute('aria-describedby', 'data-ida-erro');
  }

  // --- Definir data mínima como hoje ---
  function getHojeStr() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  if (inputData) {
    inputData.min = getHojeStr();
  }

  let selectedIndex = -1;
  /** @type {{ nome: string, uf: string } | null} */
  let destinoSelecionado = null;

  // --- Validação de data ---
  function validarData() {
    if (!inputData || !inputData.value) {
      if (dataErroEl) {
        dataErroEl.textContent = '';
        dataErroEl.classList.add('hidden');
      }
      inputDataDisplay?.classList.remove('border-error');
      return true;
    }

    const hojeStr = getHojeStr();
    if (inputData.value < hojeStr) {
      if (dataErroEl) {
        dataErroEl.textContent = 'A data não pode ser anterior a hoje.';
        dataErroEl.classList.remove('hidden');
      }
      inputDataDisplay?.classList.add('border-error');
      return false;
    }

    if (dataErroEl) {
      dataErroEl.textContent = '';
      dataErroEl.classList.add('hidden');
    }
    inputDataDisplay?.classList.remove('border-error');
    return true;
  }

  // --- Autocomplete ---
  function renderSugestoes(filtro = '') {
    const termo = (filtro || '').trim();
    const termoNorm = normalizar(termo);
    listaSugestoes.innerHTML = '';
    selectedIndex = -1;
    inputDestino.removeAttribute('aria-activedescendant');

    if (termoNorm.length === 0) {
      // Cabeçalho fixo com contagem total
      const liHeader = document.createElement('li');
      liHeader.className = 'px-4 py-2 bg-[#F6F5F0] text-deep-navy font-label-caps text-[11px] font-bold tracking-wider uppercase flex items-center justify-between border-b border-outline-variant/30 sticky top-0 z-10 select-none';
      liHeader.innerHTML = `<span>Selecione uma cidade</span><span class="text-outline font-normal normal-case tracking-normal">${DESTINOS.length} destinos</span>`;
      listaSugestoes.appendChild(liHeader);

      const grupos = agruparPorUF();
      const ordemUF = ['BA', 'MG', 'GO', 'DF'];
      let globalIdx = 0;

      ordemUF.forEach(uf => {
        const cidades = grupos[uf] || [];
        if (cidades.length === 0) return;

        // Cabeçalho do Estado
        const liEstado = document.createElement('li');
        liEstado.className = 'px-4 py-1.5 bg-[#EEECE5] text-deep-navy font-headline-md font-bold text-[12px] tracking-wide flex items-center justify-between border-b border-t border-outline-variant/30 sticky top-[33px] z-[5] select-none';
        const nomeEstado = NOMES_UF[uf] || uf;
        liEstado.innerHTML = `<span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-vibrant-gold shrink-0"></span>${escapeHtml(nomeEstado)} (${uf})</span><span class="text-[11px] text-outline font-normal">${cidades.length} ${cidades.length === 1 ? 'cidade' : 'cidades'}</span>`;
        listaSugestoes.appendChild(liEstado);

        cidades.forEach((destino) => {
          const li = document.createElement('li');
          li.className = 'suggestion-item';
          li.setAttribute('role', 'option');
          li.setAttribute('id', `suggestion-${globalIdx++}`);
          const isCurrent = destinoSelecionado && destinoSelecionado.nome === destino.nome && destinoSelecionado.uf === destino.uf;
          li.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
          if (isCurrent) {
            li.classList.add('is-selected');
          }
          li.setAttribute('data-nome', destino.nome);
          li.setAttribute('data-uf', destino.uf);

          const detalheHtml = destino.detalhe
            ? `<span class="text-[11px] text-outline opacity-50 ml-1">(${escapeHtml(destino.detalhe)})</span>`
            : '';

          li.innerHTML = `<span class="material-symbols-outlined text-[16px] mr-2 text-vibrant-gold shrink-0" aria-hidden="true">location_on</span><span class="truncate">${escapeHtml(destino.nome)}</span>${detalheHtml}<span class="ml-auto text-[11px] text-outline opacity-60 pl-2 shrink-0">${destino.uf}</span>`;

          const onSelect = (e) => {
            if (e.type === 'mousedown') e.preventDefault();
            selecionarCidade(destino);
          };
          li.addEventListener('mousedown', onSelect);
          li.addEventListener('click', onSelect);

          listaSugestoes.appendChild(li);
        });
      });

      listaSugestoes.classList.remove('hidden');
      inputDestino.setAttribute('aria-expanded', 'true');
      return;
    }

    const resultados = buscarDestinos(termo);

    if (resultados.length === 0) {
      // Sem resultados — mostrar fallback
      const liMsg = document.createElement('li');
      liMsg.className = 'suggestion-item suggestion-empty';
      liMsg.setAttribute('role', 'option');
      liMsg.setAttribute('aria-disabled', 'true');
      liMsg.setAttribute('aria-selected', 'false');
      liMsg.innerHTML = `<span class="material-symbols-outlined text-[16px] mr-2 opacity-50" aria-hidden="true">search_off</span>Não encontrou seu destino? Consulte nossa equipe pelo WhatsApp.`;
      listaSugestoes.appendChild(liMsg);

      // Botão "Consultar este destino"
      const liFallback = document.createElement('li');
      liFallback.className = 'suggestion-item suggestion-fallback';
      liFallback.setAttribute('role', 'option');
      liFallback.setAttribute('id', 'suggestion-fallback');
      liFallback.setAttribute('aria-selected', 'false');
      liFallback.setAttribute('data-fallback', 'true');
      liFallback.innerHTML = `<svg class="w-[16px] h-[16px] mr-2 text-vibrant-gold shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.469 3.484 1.359 4.984L2 22l5.188-1.359c1.453.797 3.109 1.219 4.844 1.219 5.516 0 9.969-4.453 9.969-9.969S17.547 2 12.031 2zm5.828 14.141c-.25.703-1.453 1.344-2.016 1.422-.516.078-1.172.109-1.906-.125-.453-.141-1.031-.328-1.766-.641-3.109-1.344-5.141-4.484-5.297-4.688-.156-.203-1.266-1.688-1.266-3.219s.797-2.281 1.078-2.594c.281-.312.609-.391.812-.391.203 0 .406.016.578.016.188 0 .438-.078.688.516.25.609.859 2.094.938 2.25.078.156.125.344.031.547-.094.203-.141.328-.297.5-.156.172-.312.391-.453.516-.156.141-.312.312-.141.609.172.297.766 1.266 1.641 2.047 1.125 1 2.078 1.312 2.375 1.469.297.156.469.125.641-.078.172-.203.75-.875.953-1.172.203-.297.406-.25.672-.156.266.094 1.703.812 2 .953.297.141.484.219.562.344.078.125.078.719-.172 1.422z"/></svg>Consultar "<strong>${escapeHtml(termo)}</strong>"`;

      const onFallback = (e) => {
        if (e.type === 'mousedown') e.preventDefault();
        consultarDestinoLivre(termo);
      };
      liFallback.addEventListener('mousedown', onFallback);
      liFallback.addEventListener('click', onFallback);

      listaSugestoes.appendChild(liFallback);
      listaSugestoes.classList.remove('hidden');
      inputDestino.setAttribute('aria-expanded', 'true');
      return;
    }

    // Renderizar resultados filtrados
    resultados.forEach((destino, i) => {
      const li = document.createElement('li');
      li.className = 'suggestion-item';
      li.setAttribute('role', 'option');
      li.setAttribute('id', `suggestion-${i}`);
      li.setAttribute('aria-selected', 'false');
      li.setAttribute('data-nome', destino.nome);
      li.setAttribute('data-uf', destino.uf);

      // Highlight matching text
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

      li.innerHTML = `<span class="material-symbols-outlined text-[16px] mr-2 text-vibrant-gold shrink-0" aria-hidden="true">location_on</span><span class="truncate">${nomeHtml}</span>${detalheHtml}<span class="ml-auto text-[11px] text-outline opacity-60 pl-2 shrink-0">${destino.uf}</span>`;

      const onSelect = (e) => {
        if (e.type === 'mousedown') e.preventDefault();
        selecionarCidade(destino);
      };
      li.addEventListener('mousedown', onSelect);
      li.addEventListener('click', onSelect);

      listaSugestoes.appendChild(li);
    });

    // Item extra: "Consultar [texto]" se o usuário quiser algo que não está na lista
    const liConsultar = document.createElement('li');
    liConsultar.className = 'suggestion-item suggestion-fallback';
    liConsultar.setAttribute('role', 'option');
    liConsultar.setAttribute('id', `suggestion-fallback`);
    liConsultar.setAttribute('aria-selected', 'false');
    liConsultar.setAttribute('data-fallback', 'true');
    liConsultar.innerHTML = `<span class="material-symbols-outlined text-[16px] mr-2 text-outline/50" aria-hidden="true">help_outline</span><span class="text-on-surface/60">Consultar "<strong>${escapeHtml(termo)}</strong>" mesmo assim</span>`;

    const onConsultar = (e) => {
      if (e.type === 'mousedown') e.preventDefault();
      consultarDestinoLivre(termo);
    };
    liConsultar.addEventListener('mousedown', onConsultar);
    liConsultar.addEventListener('click', onConsultar);

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
    limparErroDestino();
    listaSugestoes.classList.add('hidden');
    listaSugestoes.innerHTML = '';
    inputDestino.setAttribute('aria-expanded', 'false');
    inputDestino.removeAttribute('aria-activedescendant');
    selectedIndex = -1;
    validarFormulario();
    if (inputDataDisplay) {
      inputDataDisplay.focus();
      calendario?.abrir();
    }
  }

  /**
   * Seleciona a cidade a partir da listagem inferior e rola até o formulário.
   */
  function selecionarCidadeDaListagem(destino) {
    selecionarCidade(destino);
    // Rolar suavemente até o formulário
    const formEl = document.getElementById('busca-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Focar no campo de data (ou botão) após a rolagem
      setTimeout(() => {
        if (inputDataDisplay) {
          inputDataDisplay.focus();
          calendario?.abrir();
        } else {
          btnConsultar.focus();
        }
      }, 600);
    }
  }

  function consultarDestinoLivre(texto) {
    const textoLimpo = texto.trim();
    if (textoLimpo.length === 0) return;

    // Validar data antes de abrir WhatsApp
    if (!validarData()) return;

    limparErroDestino();
    listaSugestoes.classList.add('hidden');
    inputDestino.setAttribute('aria-expanded', 'false');

    let dataStr = 'a definir';
    if (inputData && inputData.value) {
      const [ano, mes, dia] = inputData.value.split('-');
      dataStr = `${dia}/${mes}/${ano}`;
    }

    animarBotaoEnvio();
    const mensagem = MENSAGEM_DESTINO_LIVRE(textoLimpo, dataStr);
    const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  const abrirSugestoes = () => {
    if (destinoSelecionado && inputDestino.value.includes(destinoSelecionado.nome)) {
      renderSugestoes('');
      const selectedEl = listaSugestoes.querySelector('.is-selected');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    } else {
      renderSugestoes(inputDestino.value);
    }
  };

  inputDestino.addEventListener('input', () => {
    destinoSelecionado = null;
    limparErroDestino();
    renderSugestoes(inputDestino.value);
    validarFormulario();
  });

  inputDestino.addEventListener('blur', () => {
    setTimeout(() => {
      const texto = inputDestino.value.trim();
      if (texto.length > 0 && !destinoSelecionado && listaSugestoes.classList.contains('hidden')) {
        const textoNorm = normalizar(texto);
        const exactMatch = DESTINOS.find(d => normalizar(d.nome) === textoNorm);
        if (exactMatch) {
          selecionarCidade(exactMatch);
        } else {
          mostrarErroDestino('Selecione uma cidade na lista de sugestões para continuar.');
        }
      }
    }, 200);
  });

  inputDestino.addEventListener('focus', () => {
    abrirSugestoes();
  });

  inputDestino.addEventListener('click', () => {
    if (listaSugestoes.classList.contains('hidden')) {
      abrirSugestoes();
    }
    // Em telas sem touch (desktop), seleciona o texto se já tiver destino para facilitar substituição rápida
    if (destinoSelecionado && !window.matchMedia('(pointer: coarse)').matches) {
      inputDestino.select();
    }
  });

  // Fechar lista de sugestões ao clicar fora do campo
  document.addEventListener('click', (e) => {
    if (!inputDestino.parentElement.contains(e.target) && !listaSugestoes.contains(e.target)) {
      listaSugestoes.classList.add('hidden');
      inputDestino.setAttribute('aria-expanded', 'false');
      inputDestino.removeAttribute('aria-activedescendant');
      selectedIndex = -1;
    }
  });

  // Keyboard navigation
  inputDestino.addEventListener('keydown', (e) => {
    const items = listaSugestoes.querySelectorAll('.suggestion-item:not(.suggestion-empty)');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (items.length === 0) return;
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      updateSelection(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length === 0) return;
      selectedIndex = Math.max(selectedIndex - 1, 0);
      updateSelection(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();

      // 1) Se há um item destacado pelas setas, seleciona-o
      if (selectedIndex >= 0 && items[selectedIndex]) {
        const item = items[selectedIndex];
        if (item.dataset.fallback === 'true') {
          consultarDestinoLivre(inputDestino.value);
        } else {
          selecionarCidade({ nome: item.dataset.nome, uf: item.dataset.uf });
        }
        return;
      }

      // 2) Se não há item destacado, tenta correspondência exata pelo texto digitado
      const texto = inputDestino.value.trim();
      if (texto.length > 0 && !destinoSelecionado) {
        const textoNorm = normalizar(texto);
        const exactMatch = DESTINOS.find(d => normalizar(d.nome) === textoNorm);
        if (exactMatch) {
          selecionarCidade(exactMatch);
          return;
        }
      }

      // 3) Se já tem destino selecionado, submete o formulário
      if (destinoSelecionado) {
        form?.dispatchEvent(new Event('submit', { cancelable: true }));
        return;
      }

      // 4) Se nenhuma condição se aplica, exibe mensagem de erro clara
      if (texto.length === 0) {
        mostrarErroDestino('Por favor, digite e selecione a cidade de destino.');
      } else {
        mostrarErroDestino('Selecione uma cidade na lista de sugestões abaixo.');
        renderSugestoes(texto);
      }

    } else if (e.key === 'Escape') {
      listaSugestoes.classList.add('hidden');
      inputDestino.setAttribute('aria-expanded', 'false');
      inputDestino.removeAttribute('aria-activedescendant');
      selectedIndex = -1;
    }
  });

  function updateSelection(items) {
    items.forEach((item, i) => {
      if (i === selectedIndex) {
        item.classList.add('is-selected');
        item.setAttribute('aria-selected', 'true');
        item.scrollIntoView({ block: 'nearest' });
        inputDestino.setAttribute('aria-activedescendant', item.id);
      } else {
        item.classList.remove('is-selected');
        item.setAttribute('aria-selected', 'false');
      }
    });
    if (selectedIndex < 0) {
      inputDestino.removeAttribute('aria-activedescendant');
    }
  }

  // --- Validação (destino obrigatório, data opcional mas válida) ---
  function validarFormulario() {
    const destinoPreenchido = destinoSelecionado !== null && inputDestino.value.trim().length > 0;
    const dataValida = validarData();
    const formularioValido = destinoPreenchido && dataValida;

    btnConsultar.setAttribute('aria-disabled', formularioValido ? 'false' : 'true');

    if (formularioValido) {
      btnConsultar.classList.remove('opacity-50');
      btnConsultar.classList.add('hover:-translate-y-1', 'hover:shadow-[0px_4px_0px_0px_#12205C]');
    } else {
      btnConsultar.classList.add('opacity-50');
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

      // Se o usuário digitou o nome exato da cidade sem clicar na sugestão, seleciona automaticamente
      if (!destinoSelecionado) {
        const texto = inputDestino.value.trim();
        if (texto.length === 0) {
          mostrarErroDestino('Por favor, digite e selecione a cidade de destino.');
          inputDestino.focus();
          return;
        }
        const textoNorm = normalizar(texto);
        const exactMatch = DESTINOS.find(d => normalizar(d.nome) === textoNorm);
        if (exactMatch) {
          destinoSelecionado = { nome: exactMatch.nome, uf: exactMatch.uf };
          inputDestino.value = `${exactMatch.nome} — ${exactMatch.uf}`;
          limparErroDestino();
          validarFormulario();
        } else {
          mostrarErroDestino('Selecione uma cidade da lista de sugestões abaixo (ou clique em "Consultar mesmo assim").');
          inputDestino.focus();
          renderSugestoes(texto);
          return;
        }
      }

      if (!validarData()) return;

      let dataStr = 'a definir';
      if (inputData && inputData.value) {
        const [ano, mes, dia] = inputData.value.split('-');
        dataStr = `${dia}/${mes}/${ano}`;
      }

      animarBotaoEnvio();
      const mensagem = MENSAGEM_DESTINO_CADASTRADO(destinoSelecionado.nome, destinoSelecionado.uf, dataStr);
      const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  // Pré-selecionar destino via URL parameter (ex: ?destino=Irecê)
  const urlParams = new URLSearchParams(window.location.search);
  const destinoParam = urlParams.get('destino');
  if (destinoParam) {
    const termoNorm = normalizar(destinoParam);
    const matches = buscarDestinos(destinoParam);

    // Só seleciona automaticamente se houver correspondência EXATA
    const exactMatch = matches.find(d => normalizar(d.nome) === termoNorm);

    if (exactMatch) {
      selecionarCidade(exactMatch);
    } else {
      inputDestino.value = destinoParam;
      destinoSelecionado = null;
      renderSugestoes(destinoParam);
    }
  }

  validarFormulario();

  // --- Listagem completa de destinos (interativa) ---
  if (listagemContainer) {
    renderListagem();
  }

  function renderListagem() {
    const grupos = agruparPorUF();

    // --- Filtro de busca na listagem ---
    let filterHtml = `
      <div class="mb-8 reveal-up">
        <label for="filtro-listagem" class="font-label-caps text-label-caps text-deep-navy/70 mb-1.5 flex items-center gap-1.5 tracking-widest uppercase">
          <span class="material-symbols-outlined text-[16px] text-vibrant-gold" style="font-variation-settings: 'FILL' 1;" aria-hidden="true">filter_list</span>
          Buscar cidade na lista
        </label>
        <div class="relative max-w-md">
          <input type="text" id="filtro-listagem" placeholder="Ex: Irecê, Brumado, Montes Claros…"
            autocomplete="off"
            class="w-full bg-pure-white border border-outline-variant/40 rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-outline/50 focus:border-vibrant-gold focus:ring-2 focus:ring-vibrant-gold/30 transition-all"
            aria-label="Filtrar cidades na listagem"
            aria-describedby="filtro-status">
          <span class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-outline/50" aria-hidden="true">search</span>
        </div>
        <p id="filtro-status" class="sr-only" aria-live="polite" role="status"></p>
      </div>
    `;

    let listaHtml = '';

    for (const [uf, destinos] of Object.entries(grupos)) {
      if (destinos.length === 0) continue;

      const nomeEstado = NOMES_UF[uf] || uf;
      const isPrimario = uf === 'BA';

      listaHtml += `
        <div class="listagem-uf-group ${isPrimario ? 'listagem-uf-primary' : ''} reveal-up" data-uf="${uf}">
          <h3 class="font-headline-md text-headline-md text-deep-navy mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-vibrant-gold" style="font-variation-settings: 'FILL' 1;" aria-hidden="true">location_on</span>
            ${nomeEstado}
            <span class="text-[13px] font-normal text-outline ml-1 listagem-uf-count">(${destinos.length} ${destinos.length === 1 ? 'destino' : 'destinos'})</span>
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-1">
            ${destinos.map(d => {
              const detalheHtml = d.detalhe ? `<span class="block text-[11px] text-outline/60 leading-tight">${d.detalhe}</span>` : '';
              return `<button type="button" class="listagem-cidade-btn text-left font-body-md text-body-md text-on-surface py-1.5 px-1 -mx-1 rounded hover:bg-vibrant-gold/10 hover:text-deep-navy focus-visible:ring-2 focus-visible:ring-vibrant-gold focus-visible:rounded transition-colors cursor-pointer" data-nome="${escapeHtml(d.nome)}" data-uf="${d.uf}" data-detalhe="${d.detalhe || ''}" aria-label="Selecionar ${d.nome}, ${NOMES_UF[d.uf] || d.uf}">${d.nome}${detalheHtml}</button>`;
            }).join('')}
          </div>
        </div>
      `;
    }

    // "Não encontrou sua cidade?"
    listaHtml += `
      <div class="mt-10 p-6 bg-cream-canvas rounded-lg border border-vibrant-gold/20 text-center reveal-up" id="listagem-nao-encontrou">
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
          <svg class="w-[18px] h-[18px] shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.469 3.484 1.359 4.984L2 22l5.188-1.359c1.453.797 3.109 1.219 4.844 1.219 5.516 0 9.969-4.453 9.969-9.969S17.547 2 12.031 2zm5.828 14.141c-.25.703-1.453 1.344-2.016 1.422-.516.078-1.172.109-1.906-.125-.453-.141-1.031-.328-1.766-.641-3.109-1.344-5.141-4.484-5.297-4.688-.156-.203-1.266-1.688-1.266-3.219s.797-2.281 1.078-2.594c.281-.312.609-.391.812-.391.203 0 .406.016.578.016.188 0 .438-.078.688.516.25.609.859 2.094.938 2.25.078.156.125.344.031.547-.094.203-.141.328-.297.5-.156.172-.312.391-.453.516-.156.141-.312.312-.141.609.172.297.766 1.266 1.641 2.047 1.125 1 2.078 1.312 2.375 1.469.297.156.469.125.641-.078.172-.203.75-.875.953-1.172.203-.297.406-.25.672-.156.266.094 1.703.812 2 .953.297.141.484.219.562.344.078.125.078.719-.172 1.422z"/></svg>
          Consultar pelo WhatsApp
        </a>
      </div>
    `;

    // Mensagem de "sem resultados" do filtro (inicialmente oculta)
    listaHtml += `
      <div id="filtro-sem-resultado" class="hidden mt-6 p-6 bg-cream-canvas rounded-lg border border-vibrant-gold/20 text-center">
        <p class="font-body-md text-body-md text-on-surface mb-3">
          <span class="material-symbols-outlined text-outline align-middle mr-1" aria-hidden="true">search_off</span>
          <strong>Nenhuma cidade encontrada para este termo.</strong>
        </p>
        <p class="font-body-md text-[14px] text-on-surface/70 mb-4">
          Verifique a grafia ou consulte nossa equipe pelo WhatsApp.
        </p>
        <a href="https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent('Olá! Gostaria de saber se vocês atendem um destino que não encontrei no site, saindo de São Paulo.')}"
           target="_blank" rel="noopener noreferrer"
           class="inline-flex items-center gap-2 bg-vibrant-gold text-deep-navy px-6 py-3 rounded-lg font-headline-md font-bold text-[14px] tracking-tight hover:-translate-y-1 hover:shadow-[0px_4px_0px_0px_#12205C] transition-all">
          <svg class="w-[18px] h-[18px] shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.469 3.484 1.359 4.984L2 22l5.188-1.359c1.453.797 3.109 1.219 4.844 1.219 5.516 0 9.969-4.453 9.969-9.969S17.547 2 12.031 2zm5.828 14.141c-.25.703-1.453 1.344-2.016 1.422-.516.078-1.172.109-1.906-.125-.453-.141-1.031-.328-1.766-.641-3.109-1.344-5.141-4.484-5.297-4.688-.156-.203-1.266-1.688-1.266-3.219s.797-2.281 1.078-2.594c.281-.312.609-.391.812-.391.203 0 .406.016.578.016.188 0 .438-.078.688.516.25.609.859 2.094.938 2.25.078.156.125.344.031.547-.094.203-.141.328-.297.5-.156.172-.312.391-.453.516-.156.141-.312.312-.141.609.172.297.766 1.266 1.641 2.047 1.125 1 2.078 1.312 2.375 1.469.297.156.469.125.641-.078.172-.203.75-.875.953-1.172.203-.297.406-.25.672-.156.266.094 1.703.812 2 .953.297.141.484.219.562.344.078.125.078.719-.172 1.422z"/></svg>
          Consultar pelo WhatsApp
        </a>
      </div>
    `;

    listagemContainer.innerHTML = filterHtml + listaHtml;

    // --- Attach click handlers to city buttons ---
    listagemContainer.querySelectorAll('.listagem-cidade-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const destino = { nome: btn.dataset.nome, uf: btn.dataset.uf };
        selecionarCidadeDaListagem(destino);
      });
    });

    // --- Filtro inline ---
    const filtroInput = document.getElementById('filtro-listagem');
    const filtroStatus = document.getElementById('filtro-status');
    const semResultadoEl = document.getElementById('filtro-sem-resultado');
    const naoEncontrouEl = document.getElementById('listagem-nao-encontrou');

    if (filtroInput) {
      filtroInput.addEventListener('input', () => {
        const termo = filtroInput.value.trim();
        const termoNorm = normalizar(termo);
        const groups = listagemContainer.querySelectorAll('.listagem-uf-group');
        let totalVisible = 0;

        groups.forEach(group => {
          const buttons = group.querySelectorAll('.listagem-cidade-btn');
          let groupVisible = 0;

          buttons.forEach(btn => {
            const nomeNorm = normalizar(btn.dataset.nome);
            const ufNorm = normalizar(btn.dataset.uf);
            const detalheNorm = normalizar(btn.dataset.detalhe || '');
            const match = termoNorm.length === 0 ||
              nomeNorm.includes(termoNorm) ||
              ufNorm.includes(termoNorm) ||
              detalheNorm.includes(termoNorm);

            btn.style.display = match ? '' : 'none';
            if (match) groupVisible++;
          });

          group.style.display = groupVisible > 0 ? '' : 'none';
          // Update count
          const countEl = group.querySelector('.listagem-uf-count');
          if (countEl && termoNorm.length > 0) {
            countEl.textContent = `(${groupVisible} ${groupVisible === 1 ? 'destino' : 'destinos'})`;
          } else if (countEl) {
            // Reset count
            const uf = group.dataset.uf;
            const total = DESTINOS.filter(d => d.uf === uf).length;
            countEl.textContent = `(${total} ${total === 1 ? 'destino' : 'destinos'})`;
          }
          totalVisible += groupVisible;
        });

        // Mostrar/ocultar mensagem de "sem resultado"
        if (termoNorm.length > 0 && totalVisible === 0) {
          semResultadoEl?.classList.remove('hidden');
          naoEncontrouEl?.classList.add('hidden');
        } else {
          semResultadoEl?.classList.add('hidden');
          naoEncontrouEl?.classList.toggle('hidden', termoNorm.length > 0 && totalVisible > 0 && totalVisible < DESTINOS.length);
          if (termoNorm.length === 0) naoEncontrouEl?.classList.remove('hidden');
        }

        // Status para leitores de tela
        if (filtroStatus) {
          if (termoNorm.length === 0) {
            filtroStatus.textContent = `${DESTINOS.length} destinos disponíveis.`;
          } else if (totalVisible === 0) {
            filtroStatus.textContent = 'Nenhum destino encontrado.';
          } else {
            filtroStatus.textContent = `${totalVisible} ${totalVisible === 1 ? 'destino encontrado' : 'destinos encontrados'}.`;
          }
        }
      });
    }

    // Re-observe reveal elements (fluido e progressivo no celular com 400px de antecipação)
    const revealEls = listagemContainer.querySelectorAll('.reveal-up');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      revealEls.forEach(el => el.classList.add('is-visible'));
    } else {
      const isTouch = window.matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window);
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { root: null, threshold: 0, rootMargin: isTouch ? '0px 0px 400px 0px' : '0px 0px 60px 0px' });
      revealEls.forEach(el => observer.observe(el));
    }
  }

  // --- Mobile Menu (with full a11y: aria-hidden, tabindex, focus trap) ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuCloseBtn = document.getElementById('mobile-menu-close');

  if (mobileMenuBtn && mobileMenu) {
    const focusableEls = mobileMenu.querySelectorAll('a, button');

    const toggleMenu = (open) => {
      const isExpanded = open !== undefined ? open : mobileMenuBtn.getAttribute('aria-expanded') === 'false';
      mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
      mobileMenu.setAttribute('aria-hidden', !isExpanded);

      if (isExpanded) {
        mobileMenu.classList.remove('translate-x-full');
        mobileMenu.classList.add('translate-x-0');
        document.body.style.overflow = 'hidden';
        focusableEls.forEach(el => el.removeAttribute('tabindex'));
        setTimeout(() => mobileMenuCloseBtn?.focus(), 300);
      } else {
        mobileMenu.classList.add('translate-x-full');
        mobileMenu.classList.remove('translate-x-0');
        document.body.style.overflow = '';
        focusableEls.forEach(el => el.setAttribute('tabindex', '-1'));
        mobileMenuBtn.focus();
      }
    };

    mobileMenuBtn.addEventListener('click', () => toggleMenu());
    mobileMenuCloseBtn?.addEventListener('click', () => toggleMenu(false));

    focusableEls.forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenuBtn.getAttribute('aria-expanded') === 'true') {
        toggleMenu(false);
      }
    });

    mobileMenu.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusable = Array.from(mobileMenu.querySelectorAll('a:not([tabindex="-1"]), button:not([tabindex="-1"])'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  // --- Reveal animations (fluido e progressivo no celular com 400px de antecipação) ---
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealElements = document.querySelectorAll('.reveal-up');

  if (prefersReducedMotion) {
    revealElements.forEach(el => el.classList.add('is-visible'));
  } else {
    const isTouch = window.matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window);
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { root: null, threshold: 0, rootMargin: isTouch ? '0px 0px 400px 0px' : '0px 0px 60px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // Revelar imediatamente elementos da primeira dobra e arredores
    const revealInitial = () => {
      const threshold = window.innerHeight * 1.5;
      revealElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= threshold) {
          el.classList.add('is-visible');
        }
      });
    };
    revealInitial();
    setTimeout(revealInitial, 100);
  }
});
