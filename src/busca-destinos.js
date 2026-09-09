/**
 * busca-destinos.js
 * Lógica da página de busca de destinos (destinos.html).
 * — Autocomplete de destinos
 * — Validação do formulário
 * — Redirecionamento para WhatsApp com mensagem dinâmica
 */

// ============================================================
// TEMPLATE DA MENSAGEM WHATSAPP
// Edite APENAS este template para alterar o texto enviado.
// Os placeholders {destino} e {data} são substituídos automaticamente.
// ============================================================
const MENSAGEM_WHATSAPP = (destino, data) =>
  `Olá! Gostaria de saber os valores da passagem de São Paulo para ${destino}, saindo em ${data}.`;

const WHATSAPP_NUMERO = '5511954047211';

// ============================================================
// LISTA DE CIDADES ATENDIDAS
// TODO: Completar com as 200+ cidades restantes.
// Mantenha em ordem alfabética para facilitar manutenção.
// ============================================================
const CIDADES_ATENDIDAS = [
  'América Dourada',
  'Canarana',
  'Iraquara',
  'Irecê',
  'João Dourado',
  'Lapão',
  'Presidente Dutra',
  'Salobro',
  'Seabra',
  'Souto Soares',
  'Vitória da Conquista',
];

document.addEventListener('DOMContentLoaded', () => {
  const inputDestino = document.getElementById('destino-input');
  const listaSugestoes = document.getElementById('destino-suggestions');
  const inputData = document.getElementById('data-ida');
  const btnVerValores = document.getElementById('btn-ver-valores');
  const form = document.getElementById('busca-form');

  if (!inputDestino || !listaSugestoes || !inputData || !btnVerValores) return;

  // --- Definir data mínima como hoje ---
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = String(hoje.getMonth() + 1).padStart(2, '0');
  const diaAtual = String(hoje.getDate()).padStart(2, '0');
  inputData.min = `${anoAtual}-${mesAtual}-${diaAtual}`;

  let selectedIndex = -1;
  let cidadeValida = false;

  // --- Autocomplete ---
  function renderSugestoes(filtro) {
    const termo = filtro.toLowerCase().trim();
    listaSugestoes.innerHTML = '';
    selectedIndex = -1;

    if (termo.length === 0) {
      listaSugestoes.classList.add('hidden');
      return;
    }

    const resultados = CIDADES_ATENDIDAS.filter(c =>
      c.toLowerCase().includes(termo)
    );

    if (resultados.length === 0) {
      const li = document.createElement('li');
      li.className = 'suggestion-item suggestion-empty';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-disabled', 'true');
      li.innerHTML = `<span class="material-symbols-outlined text-[16px] mr-2 opacity-50" aria-hidden="true">search_off</span>Nenhum destino encontrado`;
      listaSugestoes.appendChild(li);
      listaSugestoes.classList.remove('hidden');
      return;
    }

    resultados.forEach((cidade, i) => {
      const li = document.createElement('li');
      li.className = 'suggestion-item';
      li.setAttribute('role', 'option');
      li.setAttribute('id', `suggestion-${i}`);
      li.setAttribute('data-value', cidade);

      // Highlight matching text
      const idx = cidade.toLowerCase().indexOf(termo);
      const before = cidade.slice(0, idx);
      const match = cidade.slice(idx, idx + termo.length);
      const after = cidade.slice(idx + termo.length);

      li.innerHTML = `<span class="material-symbols-outlined text-[16px] mr-2 text-vibrant-gold" aria-hidden="true">location_on</span>${before}<strong class="text-deep-navy">${match}</strong>${after}<span class="ml-auto text-[11px] text-outline opacity-60">BA</span>`;

      li.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevent blur before click registers
        selecionarCidade(cidade);
      });

      listaSugestoes.appendChild(li);
    });

    listaSugestoes.classList.remove('hidden');
  }

  function selecionarCidade(cidade) {
    inputDestino.value = cidade;
    cidadeValida = true;
    listaSugestoes.classList.add('hidden');
    listaSugestoes.innerHTML = '';
    selectedIndex = -1;
    validarFormulario();
    inputData.focus();
  }

  inputDestino.addEventListener('input', () => {
    cidadeValida = false;
    renderSugestoes(inputDestino.value);
    validarFormulario();
  });

  inputDestino.addEventListener('focus', () => {
    if (inputDestino.value.trim().length > 0) {
      renderSugestoes(inputDestino.value);
    }
  });

  inputDestino.addEventListener('blur', () => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      listaSugestoes.classList.add('hidden');
    }, 150);
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
        selecionarCidade(items[selectedIndex].dataset.value);
      }
    } else if (e.key === 'Escape') {
      listaSugestoes.classList.add('hidden');
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

  // --- Validação ---
  function validarFormulario() {
    const destinoPreenchido = cidadeValida && inputDestino.value.trim().length > 0;
    const dataPreenchida = inputData.value.length > 0;
    const valido = destinoPreenchido && dataPreenchida;

    btnVerValores.disabled = !valido;

    if (valido) {
      btnVerValores.classList.remove('opacity-50', 'cursor-not-allowed');
      btnVerValores.classList.add('hover:-translate-y-1', 'hover:shadow-[0px_4px_0px_0px_#12205C]');
    } else {
      btnVerValores.classList.add('opacity-50', 'cursor-not-allowed');
      btnVerValores.classList.remove('hover:-translate-y-1', 'hover:shadow-[0px_4px_0px_0px_#12205C]');
    }
  }

  inputData.addEventListener('change', validarFormulario);
  inputData.addEventListener('input', validarFormulario);

  // --- Submissão → WhatsApp ---
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (btnVerValores.disabled) return;

    const destino = inputDestino.value.trim();

    // Formatar data para dd/mm/aaaa
    const [ano, mes, dia] = inputData.value.split('-');
    const dataFormatada = `${dia}/${mes}/${ano}`;

    const mensagem = MENSAGEM_WHATSAPP(destino, dataFormatada);
    const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  });

  // Validar estado inicial
  validarFormulario();

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
