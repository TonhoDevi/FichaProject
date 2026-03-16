// ============================================================
// COMPÊNDIO DE TALENTOS — LÓGICA
// Arquivo: js/compendium/compendium-talents.js
// ============================================================

const STATE = {
    categoria: '',
    search:    '',
    prereq:    '', // 'sim' | 'nao' | ''
    sort:      'default',
    view:      'grid',
};

const CAT_LABELS = {
    combate:    '🗡️ Combate',
    defesa:     '🛡️ Defesa',
    magia:      '✨ Magia',
    habilidade: '🎯 Habilidade',
    geral:      '⚖️ Geral',
};

const CAT_ICONS = {
    combate:    '🗡️',
    defesa:     '🛡️',
    magia:      '✨',
    habilidade: '🎯',
    geral:      '⚖️',
};

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('talentosGrid')) return;
    preencherContadores();
    bindFiltros();
    render();
});

// ============================================================
// CONTADORES
// ============================================================
function preencherContadores() {
    const total  = TALENTOS_DATA.length;
    const porCat = {};
    TALENTOS_DATA.forEach(t => {
        porCat[t.categoria] = (porCat[t.categoria] || 0) + 1;
    });

    setEl('totalTalentos',        total);
    setEl('countCombate',         porCat.combate    || 0);
    setEl('countDefesa',          porCat.defesa     || 0);
    setEl('countMagia',           porCat.magia      || 0);
    setEl('countHabilidade',      porCat.habilidade || 0);
    setEl('countGeral',           porCat.geral      || 0);
    setEl('tab-count-all',        total);
    setEl('tab-count-combate',    porCat.combate    || 0);
    setEl('tab-count-defesa',     porCat.defesa     || 0);
    setEl('tab-count-magia',      porCat.magia      || 0);
    setEl('tab-count-habilidade', porCat.habilidade || 0);
    setEl('tab-count-geral',      porCat.geral      || 0);
}

// ============================================================
// BINDING DOS CONTROLES
// ============================================================
function bindFiltros() {
    // Busca
    const searchInput = document.getElementById('searchTalent');
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            STATE.search = e.target.value.trim();
            render();
            updateActiveTags();
        });
    }

    // Pré-requisito
    const prereqSelect = document.getElementById('filterPrereq');
    if (prereqSelect) {
        prereqSelect.addEventListener('change', e => {
            STATE.prereq = e.target.value;
            render();
            updateActiveTags();
        });
    }

    // Ordenação
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
        sortSelect.addEventListener('change', e => {
            STATE.sort = e.target.value;
            render();
        });
    }

    // Abas de categoria
    document.querySelectorAll('.cat-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            STATE.categoria = btn.dataset.cat;
            render();
            updateActiveTags();
        });
    });

    // Abas do modal (delegação)
    const modalTabs = document.getElementById('modalTabs');
    if (modalTabs) {
        modalTabs.addEventListener('click', e => {
            const tab = e.target.closest('.modal-tab');
            if (!tab) return;
            openModalTab(tab.dataset.tab);
        });
    }

    // Fechar modal com ESC
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeTalentModal();
    });

    // Fechar ao clicar fora
    const overlay = document.getElementById('talentModal');
    if (overlay) {
        overlay.addEventListener('click', e => {
            if (e.target === overlay) closeTalentModal();
        });
    }
}

// ============================================================
// FILTRAR E ORDENAR
// ============================================================
function getFiltered() {
    let list = [...TALENTOS_DATA];

    if (STATE.categoria) {
        list = list.filter(t => t.categoria === STATE.categoria);
    }

    if (STATE.prereq === 'nao') {
        list = list.filter(t => !t.prereq);
    } else if (STATE.prereq === 'sim') {
        list = list.filter(t => !!t.prereq);
    }

    if (STATE.search) {
        const q = STATE.search.toLowerCase();
        list = list.filter(t =>
            t.nome.toLowerCase().includes(q) ||
            t.descricao.toLowerCase().includes(q) ||
            t.beneficios.some(b => b.toLowerCase().includes(q)) ||
            (t.prereq && t.prereq.toLowerCase().includes(q))
        );
    }

    const ORDEM_CAT = ['combate', 'defesa', 'magia', 'habilidade', 'geral'];

    switch (STATE.sort) {
        case 'az':        list.sort((a, b) => a.nome.localeCompare(b.nome, 'pt')); break;
        case 'za':        list.sort((a, b) => b.nome.localeCompare(a.nome, 'pt')); break;
        case 'categoria': list.sort((a, b) => ORDEM_CAT.indexOf(a.categoria) - ORDEM_CAT.indexOf(b.categoria)); break;
        case 'prereq':    list.sort((a, b) => (a.prereq ? 1 : -1) - (b.prereq ? 1 : -1)); break;
        default: break;
    }

    return list;
}

// ============================================================
// RENDERIZAR GRID
// ============================================================
function render() {
    const grid  = document.getElementById('talentosGrid');
    const count = document.getElementById('resultsCount');
    if (!grid) return;

    const lista = getFiltered();

    if (count) {
        count.innerHTML = `Mostrando <strong>${lista.length}</strong> de <strong>${TALENTOS_DATA.length}</strong> talentos`;
    }

    grid.innerHTML = '';
    grid.classList.toggle('list-view', STATE.view === 'list');

    if (lista.length === 0) {
        grid.innerHTML = `
            <div class="no-results" style="grid-column:1/-1">
                <span class="no-results-icon">🗝️</span>
                Nenhum talento encontrado para os filtros selecionados.
            </div>`;
        return;
    }

    lista.forEach((talento, i) => {
        const globalIdx = TALENTOS_DATA.indexOf(talento);
        const card = document.createElement('div');
        card.className = 'talent-card';
        card.dataset.cat = talento.categoria;
        card.style.animationDelay = `${Math.min(i * 0.04, 0.5)}s`;
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Ver detalhes de ${talento.nome}`);

        const catLabel = CAT_LABELS[talento.categoria] || talento.categoria;

        card.innerHTML = `
            <div class="talent-card-header">
                <span class="talent-icon">${talento.icone}</span>
                <span class="talent-cat-badge">${catLabel}</span>
            </div>
            <div class="talent-card-body">
                <h3 class="talent-name">${talento.nome}</h3>
                ${talento.prereq
                    ? `<div class="talent-prereq">⚠️ <em>${talento.prereq}</em></div>`
                    : `<div class="talent-prereq talent-prereq--none">✅ Sem pré-requisito</div>`
                }
                <p class="talent-desc">${talento.descricao}</p>
                <div class="talent-card-footer">
                    <span class="talent-bcount">📋 ${talento.beneficios.length} benefício${talento.beneficios.length > 1 ? 's' : ''}</span>
                    <button class="card-btn">Ver Detalhes →</button>
                </div>
            </div>`;

        card.addEventListener('click', () => showTalentDetails(globalIdx));
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showTalentDetails(globalIdx);
            }
        });

        grid.appendChild(card);
    });
}

// ============================================================
// TOGGLE DE VISUALIZAÇÃO
// ============================================================
function setView(mode) {
    STATE.view = mode;
    document.getElementById('viewGrid')?.classList.toggle('active', mode === 'grid');
    document.getElementById('viewList')?.classList.toggle('active', mode === 'list');
    render();
}

// ============================================================
// TAGS DE FILTROS ATIVOS
// ============================================================
function updateActiveTags() {
    const container = document.getElementById('activeFilters');
    if (!container) return;
    container.innerHTML = '';

    const tags = [];

    if (STATE.search) {
        tags.push({
            label: `🔍 "${STATE.search}"`,
            clear: () => {
                STATE.search = '';
                const el = document.getElementById('searchTalent');
                if (el) el.value = '';
                render(); updateActiveTags();
            }
        });
    }

    if (STATE.prereq) {
        const label = STATE.prereq === 'sim' ? '⚠️ Com pré-requisito' : '✅ Sem pré-requisito';
        tags.push({
            label,
            clear: () => {
                STATE.prereq = '';
                const el = document.getElementById('filterPrereq');
                if (el) el.value = '';
                render(); updateActiveTags();
            }
        });
    }

    tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'filter-tag';
        span.innerHTML = `${tag.label} <button class="filter-tag-remove" title="Remover filtro">✕</button>`;
        span.querySelector('button').addEventListener('click', tag.clear);
        container.appendChild(span);
    });

    if (tags.length > 1) {
        const btn = document.createElement('button');
        btn.className = 'clear-filters-btn';
        btn.textContent = 'Limpar tudo';
        btn.addEventListener('click', clearAllFilters);
        container.appendChild(btn);
    }
}

function clearAllFilters() {
    STATE.search = '';
    STATE.prereq = '';
    const s = document.getElementById('searchTalent');
    const p = document.getElementById('filterPrereq');
    if (s) s.value = '';
    if (p) p.value = '';
    render();
    updateActiveTags();
}

// ============================================================
// MODAL — ABRIR / FECHAR / ABAS
// ============================================================
function showTalentDetails(index) {
    const talento = TALENTOS_DATA[index];
    if (!talento) return;
    const modal    = document.getElementById('talentModal');
    const catLabel = CAT_LABELS[talento.categoria] || talento.categoria;

    // Header
    setEl('modalTalentIcon', talento.icone);
    setEl('modalTalentName', talento.nome);

    // Badge
    const badge = document.getElementById('modalTalentBadge');
    if (badge) {
        badge.textContent = catLabel;
        badge.className   = `modal-hero-badge talent-badge--${talento.categoria}`;
    }

    // Pré-requisito
    const prereqEl = document.getElementById('modalPrereq');
    if (prereqEl) {
        prereqEl.innerHTML = talento.prereq
            ? `<span class="prereq-label">⚠️ Pré-requisito:</span> ${talento.prereq}`
            : `<span class="prereq-none">✅ Nenhum pré-requisito</span>`;
    }

    // Quick stats
    setEl('qsCategoria',  catLabel);
    setEl('qsBeneficios', talento.beneficios.length + ' benefício' + (talento.beneficios.length > 1 ? 's' : ''));
    setEl('qsPrereq',     talento.prereq ? 'Sim' : 'Não');

    // Aba: visão geral
    setEl('modalDescricao', talento.descricao);

    // Aba: benefícios
    const benefEl = document.getElementById('modalBeneficios');
    if (benefEl) {
        benefEl.innerHTML = talento.beneficios.map(b => `
            <li class="traco-item">
                <span class="traco-bullet">◆</span>
                <span>${b}</span>
            </li>`).join('');
    }

    openModalTab('geral');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeTalentModal() {
    const modal = document.getElementById('talentModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
}

function openModalTab(tabId) {
    document.querySelectorAll('.modal-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === `tab-${tabId}`);
    });
    const body = document.getElementById('modalBody');
    if (body) body.scrollTop = 0;
}

// ============================================================
// UTILITÁRIOS
// ============================================================
function setEl(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}