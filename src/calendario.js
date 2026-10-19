/**
 * calendario.js
 * Componente de Calendário customizado para Agência C&K (destinos.html).
 * — Estilizado com o design system do site (Deep Navy, Vibrant Gold, Pure White)
 * — 25% maior que calendários padrão (células de 44px, tipografia 16px, largura 356px)
 * — Bloqueia datas passadas (validação nativa de hoje em diante)
 * — Suporte a navegação por meses, atalhos "Hoje", "Limpar" e "Fechar"
 * — Totalmente acessível e integrado ao formulário WhatsApp
 */

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Retorna a data de hoje no fuso local sem horas
 */
function getHojeZero() {
  const agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
}

/**
 * Formata ano, mês, dia para YYYY-MM-DD
 */
function formatarISO(ano, mes, dia) {
  const m = String(mes + 1).padStart(2, '0');
  const d = String(dia).padStart(2, '0');
  return `${ano}-${m}-${d}`;
}

/**
 * Formata YYYY-MM-DD para formato visual amigável: "DD/MM/AAAA (Sem)"
 */
function formatarVisual(isoStr) {
  if (!isoStr) return '';
  const [ano, mes, dia] = isoStr.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia);
  const d = String(dia).padStart(2, '0');
  const m = String(mes).padStart(2, '0');
  const diaSemana = DIAS_SEMANA[data.getDay()];
  return `${d}/${m}/${ano} (${diaSemana})`;
}

export function initCalendario(onSelectCallback) {
  const container = document.getElementById('campo-data-grupo');
  const inputDisplay = document.getElementById('data-ida-display');
  const inputReal = document.getElementById('data-ida');
  const btnTrigger = document.getElementById('data-ida-trigger');
  const btnClear = document.getElementById('data-ida-clear');
  const popover = document.getElementById('calendario-popover');

  const backdrop = document.getElementById('calendario-backdrop') || popover;

  if (!container || !inputDisplay || !inputReal || !popover) return;

  const hoje = getHojeZero();
  let viewAno = hoje.getFullYear();
  let viewMes = hoje.getMonth();
  let selectedDateStr = inputReal.value || '';

  // Sincronizar display inicial se houver valor
  if (selectedDateStr) {
    inputDisplay.value = formatarVisual(selectedDateStr);
    btnClear?.classList.remove('hidden');
  }

  function abrirCalendario() {
    if (selectedDateStr) {
      const [ano, mes] = selectedDateStr.split('-').map(Number);
      viewAno = ano;
      viewMes = mes - 1;
    } else {
      viewAno = hoje.getFullYear();
      viewMes = hoje.getMonth();
    }
    renderCalendario();
    backdrop.classList.remove('hidden');
    inputDisplay.setAttribute('aria-expanded', 'true');

    setTimeout(() => {
      popover.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);
  }

  function fecharCalendario() {
    backdrop.classList.add('hidden');
    inputDisplay.setAttribute('aria-expanded', 'false');
  }

  function selecionarData(ano, mes, dia) {
    const iso = formatarISO(ano, mes, dia);
    selectedDateStr = iso;
    inputReal.value = iso;
    inputDisplay.value = formatarVisual(iso);
    btnClear?.classList.remove('hidden');

    // Disparar eventos nativos para acionar a validação do formulário
    inputReal.dispatchEvent(new Event('input', { bubbles: true }));
    inputReal.dispatchEvent(new Event('change', { bubbles: true }));

    if (typeof onSelectCallback === 'function') {
      onSelectCallback(iso);
    }

    fecharCalendario();
    inputDisplay.focus();
  }

  function limparData() {
    selectedDateStr = '';
    inputReal.value = '';
    inputDisplay.value = '';
    btnClear?.classList.add('hidden');

    inputReal.dispatchEvent(new Event('input', { bubbles: true }));
    inputReal.dispatchEvent(new Event('change', { bubbles: true }));

    if (typeof onSelectCallback === 'function') {
      onSelectCallback('');
    }

    renderCalendario();
    inputDisplay.focus();
  }

  function renderCalendario() {
    // Determinar se pode voltar o mês (não pode ir para antes do mês atual)
    const isMesmoAnoMes = viewAno === hoje.getFullYear() && viewMes === hoje.getMonth();
    const podeVoltarMes = !isMesmoAnoMes && !(viewAno < hoje.getFullYear() || (viewAno === hoje.getFullYear() && viewMes < hoje.getMonth()));

    const primeiroDiaSemana = new Date(viewAno, viewMes, 1).getDay();
    const totalDiasMes = new Date(viewAno, viewMes + 1, 0).getDate();
    const totalDiasMesAnt = new Date(viewAno, viewMes, 0).getDate();

    // Cabeçalho do calendário
    let html = `
      <div class="calendario-header bg-gradient-to-r from-deep-navy to-[#091233] text-pure-white px-5 py-4 flex items-center justify-between border-b border-vibrant-gold/20">
        <div>
          <span class="block text-[11px] font-label-caps text-vibrant-gold tracking-widest uppercase font-semibold">Escolha a data</span>
          <h4 class="font-headline-md font-bold text-[18px] text-pure-white leading-tight">
            ${MESES[viewMes]} <span class="text-vibrant-gold">${viewAno}</span>
          </h4>
        </div>
        <div class="flex items-center gap-1.5">
          <button type="button" id="cal-prev-month" ${!podeVoltarMes ? 'disabled' : ''}
            class="w-9 h-9 rounded-full flex items-center justify-center transition-all ${podeVoltarMes ? 'bg-white/10 hover:bg-vibrant-gold hover:text-deep-navy text-pure-white cursor-pointer' : 'opacity-20 cursor-not-allowed text-pure-white/40'}"
            aria-label="Mês anterior">
            <span class="material-symbols-outlined text-[20px]" aria-hidden="true">chevron_left</span>
          </button>
          <button type="button" id="cal-next-month"
            class="w-9 h-9 rounded-full bg-white/10 hover:bg-vibrant-gold hover:text-deep-navy text-pure-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Próximo mês">
            <span class="material-symbols-outlined text-[20px]" aria-hidden="true">chevron_right</span>
          </button>
        </div>
      </div>

      <!-- Barra dos dias da semana -->
      <div class="grid grid-cols-7 bg-[#F6F5F0] border-b border-outline-variant/20 px-3 py-2 text-center">
        ${DIAS_SEMANA.map((dia, idx) => `
          <span class="font-label-caps text-[11px] font-bold tracking-wider ${idx === 0 || idx === 6 ? 'text-secondary font-bold' : 'text-deep-navy/70'}">
            ${dia}
          </span>
        `).join('')}
      </div>

      <!-- Grade dos dias (25% maior: 44px por célula) -->
      <div class="grid grid-cols-7 gap-1.5 p-3.5 bg-pure-white" role="grid" aria-label="${MESES[viewMes]} de ${viewAno}">
    `;

    // Dias do mês anterior (desativados)
    for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
      const diaNum = totalDiasMesAnt - i;
      html += `
        <div class="h-[44px] flex items-center justify-center text-[14px] text-outline/30 select-none font-medium opacity-30 cursor-default" aria-hidden="true">
          ${diaNum}
        </div>
      `;
    }

    // Dias do mês atual
    for (let dia = 1; dia <= totalDiasMes; dia++) {
      const dataCell = new Date(viewAno, viewMes, dia);
      const isPassado = dataCell < hoje;
      const isHoje = dataCell.getTime() === hoje.getTime();
      const isoStr = formatarISO(viewAno, viewMes, dia);
      const isSelected = selectedDateStr === isoStr;

      if (isPassado) {
        html += `
          <button type="button" disabled
            class="h-[44px] w-full rounded-xl flex items-center justify-center text-[15px] font-medium text-outline/30 bg-transparent cursor-not-allowed select-none line-through"
            aria-label="${dia} de ${MESES[viewMes]} de ${viewAno}, indisponível">
            ${dia}
          </button>
        `;
      } else if (isSelected) {
        html += `
          <button type="button" data-dia="${dia}"
            class="cal-day-btn h-[44px] w-full rounded-xl flex flex-col items-center justify-center font-bold text-[16px] bg-vibrant-gold text-deep-navy shadow-md shadow-vibrant-gold/40 scale-105 cursor-pointer ring-2 ring-deep-navy/20 transition-transform"
            aria-label="${dia} de ${MESES[viewMes]} de ${viewAno}, selecionado" aria-selected="true">
            <span>${dia}</span>
            <span class="w-1.5 h-1.5 rounded-full bg-deep-navy -mt-0.5"></span>
          </button>
        `;
      } else if (isHoje) {
        html += `
          <button type="button" data-dia="${dia}"
            class="cal-day-btn h-[44px] w-full rounded-xl flex flex-col items-center justify-center font-bold text-[16px] text-deep-navy bg-vibrant-gold/15 ring-2 ring-vibrant-gold hover:bg-vibrant-gold/30 hover:scale-105 transition-all cursor-pointer"
            aria-label="${dia} de ${MESES[viewMes]} de ${viewAno}, hoje">
            <span>${dia}</span>
            <span class="text-[9px] font-bold uppercase tracking-tight text-secondary -mt-1">Hoje</span>
          </button>
        `;
      } else {
        html += `
          <button type="button" data-dia="${dia}"
            class="cal-day-btn h-[44px] w-full rounded-xl flex items-center justify-center font-semibold text-[16px] text-deep-navy hover:bg-vibrant-gold/20 hover:text-deep-navy hover:scale-105 transition-all cursor-pointer"
            aria-label="${dia} de ${MESES[viewMes]} de ${viewAno}">
            ${dia}
          </button>
        `;
      }
    }

    // Dias do próximo mês para fechar a última linha
    const totalSlotsPreenchidos = primeiroDiaSemana + totalDiasMes;
    const diasProxMes = (7 - (totalSlotsPreenchidos % 7)) % 7;
    for (let d = 1; d <= diasProxMes; d++) {
      html += `
        <div class="h-[44px] flex items-center justify-center text-[14px] text-outline/30 select-none font-medium opacity-30 cursor-default" aria-hidden="true">
          ${d}
        </div>
      `;
    }

    html += `
      </div>

      <!-- Barra inferior com ações rápidas -->
      <div class="bg-[#FAF9F5] border-t border-outline-variant/20 px-4 py-3 flex items-center justify-between text-body-md">
        <button type="button" id="cal-btn-hoje"
          class="font-body-md font-bold text-[13px] text-deep-navy hover:text-secondary hover:underline transition-colors flex items-center gap-1 cursor-pointer">
          <span class="material-symbols-outlined text-[16px] text-vibrant-gold" style="font-variation-settings: 'FILL' 1;" aria-hidden="true">today</span>
          Hoje
        </button>

        <div class="flex items-center gap-2">
          ${selectedDateStr ? `
            <button type="button" id="cal-btn-limpar"
              class="font-body-md font-medium text-[13px] text-outline hover:text-error transition-colors cursor-pointer px-2 py-1 rounded">
              Limpar
            </button>
          ` : ''}
          <button type="button" id="cal-btn-fechar"
            class="bg-deep-navy hover:bg-[#1C2F7C] text-pure-white text-[13px] font-bold px-3.5 py-1.5 rounded-lg transition-all cursor-pointer">
            Fechar
          </button>
        </div>
      </div>
    `;

    popover.innerHTML = html;

    // Vincular eventos internos do popover
    const btnPrev = popover.querySelector('#cal-prev-month');
    const btnNext = popover.querySelector('#cal-next-month');
    const btnHoje = popover.querySelector('#cal-btn-hoje');
    const btnLimpar = popover.querySelector('#cal-btn-limpar');
    const btnFechar = popover.querySelector('#cal-btn-fechar');

    btnPrev?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!podeVoltarMes) return;
      viewMes--;
      if (viewMes < 0) {
        viewMes = 11;
        viewAno--;
      }
      renderCalendario();
    });

    btnNext?.addEventListener('click', (e) => {
      e.stopPropagation();
      viewMes++;
      if (viewMes > 11) {
        viewMes = 0;
        viewAno++;
      }
      renderCalendario();
    });

    btnHoje?.addEventListener('click', (e) => {
      e.stopPropagation();
      selecionarData(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    });

    btnLimpar?.addEventListener('click', (e) => {
      e.stopPropagation();
      limparData();
    });

    btnFechar?.addEventListener('click', (e) => {
      e.stopPropagation();
      fecharCalendario();
    });

    popover.querySelectorAll('.cal-day-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dia = Number(btn.getAttribute('data-dia'));
        if (dia) {
          selecionarData(viewAno, viewMes, dia);
        }
      });
    });
  }

  // --- Eventos de Abertura / Fechamento ---
  inputDisplay.addEventListener('click', (e) => {
    e.stopPropagation();
    if (backdrop.classList.contains('hidden')) {
      abrirCalendario();
    } else {
      fecharCalendario();
    }
  });

  inputDisplay.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      abrirCalendario();
    } else if (e.key === 'Escape') {
      fecharCalendario();
    }
  });

  btnTrigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (backdrop.classList.contains('hidden')) {
      abrirCalendario();
    } else {
      fecharCalendario();
    }
  });

  btnClear?.addEventListener('click', (e) => {
    e.stopPropagation();
    limparData();
  });

  // Fechar ao clicar fora ou no fundo escuro do mobile
  document.addEventListener('click', (e) => {
    if (!backdrop.classList.contains('hidden')) {
      if (e.target === backdrop || (!container.contains(e.target) && !popover.contains(e.target))) {
        fecharCalendario();
      }
    }
  });

  // Fechar com Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !backdrop.classList.contains('hidden')) {
      fecharCalendario();
      inputDisplay.focus();
    }
  });

  // Expor método público de abertura se necessário
  return {
    abrir: abrirCalendario,
    fechar: fecharCalendario,
    limpar: limparData
  };
}
