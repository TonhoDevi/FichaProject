// ================================================================
//  meus-personagens.js
//  Coloque em: js/sheet/meus-personagens.js
//
//  Depende de (carregados antes no HTML):
//    supabase CDN, supabase-auth.js, cloud-save.js
// ================================================================

const TIPO_LABEL = { dnd: 'D&D 5e', mem: 'M&M 3e' };
const TIPO_HREF  = {
    dnd: '/html/sheet/ddt-character-sheet.html',
    mem: '/html/sheet/mem-character-sheet.html'
};

let todasFichas = [];
let filtroAtivo = '';

// ── CARREGAR FICHAS ───────────────────────────────────────────────
async function carregarFichas() {
    const user = await getUser();
    if (!user) {
        window.location.href = '/html/auth/login.html';
        return;
    }
    todasFichas = await cloudListAll(null);
    renderFichas();
    atualizarContador();
}

// ── CONTADOR DE FICHAS ────────────────────────────────────────────
function atualizarContador() {
    const total  = todasFichas.length;
    const limite = 5;
    const el     = document.getElementById('contadorFichas');

    if (el) {
        el.textContent = total + ' / ' + limite + ' fichas usadas';
        el.style.color = total >= limite
            ? 'rgba(200,80,80,0.8)'
            : 'rgba(200,160,60,0.5)';
    }

    // Desabilita botões quando atinge o limite
    document.querySelectorAll('.btn-new').forEach(function(btn) {
        btn.disabled      = total >= limite;
        btn.title         = total >= limite
            ? 'Limite de ' + limite + ' fichas atingido. Exclua uma para criar outra.'
            : '';
        btn.style.opacity = total >= limite ? '0.4' : '';
        btn.style.cursor  = total >= limite ? 'not-allowed' : '';
    });
}

// ── RENDERIZAR CARDS ──────────────────────────────────────────────
function renderFichas() {
    const grid  = document.getElementById('sheetsGrid');
    const lista = filtroAtivo
        ? todasFichas.filter(function(f) { return f.tipo === filtroAtivo; })
        : todasFichas;

    if (!lista.length) {
        grid.innerHTML =
            '<div class="empty-state">' +
                '<span class="empty-state-icon">📭</span>' +
                '<p>Nenhuma ficha encontrada.<br>Crie uma nova acima!</p>' +
            '</div>';
        return;
    }

    grid.innerHTML = lista.map(function(ficha) {
        var data  = new Date(ficha.atualizado_em).toLocaleString('pt-BR');
        var badge = ficha.tipo === 'dnd' ? 'badge-dnd' : 'badge-mem';
        var label = TIPO_LABEL[ficha.tipo] || ficha.tipo;
        var href  = TIPO_HREF[ficha.tipo]  || '#';
        return (
            '<div class="sheet-card tipo-' + ficha.tipo + '">' +
                '<span class="sheet-card-badge ' + badge + '">' + label + '</span>' +
                '<div class="sheet-card-name">' + ficha.nome + '</div>' +
                '<div class="sheet-card-date">Salvo em ' + data + '</div>' +
                '<div class="sheet-card-actions">' +
                    '<a class="btn-open" href="' + href + '" ' +
                        'onclick="abrirFicha(\'' + ficha.tipo + '\',\'' + ficha.id + '\')">' +
                        'Abrir Ficha' +
                    '</a>' +
                    '<button class="btn-delete" ' +
                        'onclick="deletarFicha(\'' + ficha.tipo + '\',\'' + ficha.id + '\',\'' + ficha.nome.replace(/'/g, "\\'") + '\')">' +
                        '🗑' +
                    '</button>' +
                '</div>' +
            '</div>'
        );
    }).join('');
}

// ── FILTRO ────────────────────────────────────────────────────────
function setFilter(tipo) {
    filtroAtivo = tipo;
    document.querySelectorAll('.filter-btn').forEach(function(btn, i) {
        btn.classList.toggle('active',
            (tipo === ''    && i === 0) ||
            (tipo === 'dnd' && i === 1) ||
            (tipo === 'mem' && i === 2)
        );
    });
    renderFichas();
}

// ── ABRIR FICHA EXISTENTE ─────────────────────────────────────────
function abrirFicha(tipo, id) {
    cloudOpenSheet(tipo, id); // seta o ID ativo para o save/load
    // a navegação acontece pelo href do <a>
}

// ── NOVA FICHA ────────────────────────────────────────────────────
async function novaFicha(tipo) {
    const pode = await cloudNewSheet(tipo); // verifica limite e limpa ID ativo
    if (pode) {
        window.location.href = TIPO_HREF[tipo];
    }
}

// ── DELETAR FICHA ─────────────────────────────────────────────────
async function deletarFicha(tipo, id, nome) {
    if (!confirm('Excluir a ficha "' + nome + '"?\nEssa acao nao pode ser desfeita.')) return;
    await cloudDelete(tipo, id);
    todasFichas = todasFichas.filter(function(f) { return f.id !== id; });
    renderFichas();
    atualizarContador();
}

// ── INIT ──────────────────────────────────────────────────────────
carregarFichas();