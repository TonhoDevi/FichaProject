/**
 * mm-character.js
 * Lógica da Ficha de Mutantes & Malfeitores 3ª Edição
 */

'use strict';

// ─────────────────────────────────────────────
//  CONSTANTES — Perícias base do sistema
// ─────────────────────────────────────────────
const MM_SKILLS = [
    { id: 'acrobacia',       label: 'Acrobacia',            attr: 'atAgilidade' },
    { id: 'atletismo',       label: 'Atletismo',            attr: 'atForca'     },
    { id: 'combateCC',       label: 'Combate Corp. a Corp.',attr: 'atLuta'      },
    { id: 'combateDist',     label: 'Combate à Distância',  attr: 'atDestreza'  },
    { id: 'conducao',        label: 'Condução',             attr: 'atDestreza'  },
    { id: 'enganacao',       label: 'Enganação',            attr: 'atPresenca'  },
    { id: 'especialidade',   label: 'Especialidade',        attr: 'atIntelecto' },
    { id: 'escavacao',       label: 'Escavação',            attr: 'atForca'     },
    { id: 'furtividade',     label: 'Furtividade',          attr: 'atAgilidade' },
    { id: 'intuicao',        label: 'Intuição',             attr: 'atPercepao'  },
    { id: 'intimidacao',     label: 'Intimidação',          attr: 'atPresenca'  },
    { id: 'investigacao',    label: 'Investigação',         attr: 'atIntelecto' },
    { id: 'magia',           label: 'Magia',                attr: 'atIntelecto' },
    { id: 'medicinal',       label: 'Medicinal',            attr: 'atIntelecto' },
    { id: 'mecanismos',      label: 'Mecanismos',           attr: 'atIntelecto' },
    { id: 'musica',          label: 'Música',               attr: 'atPresenca'  },
    { id: 'navegacao',       label: 'Navegação',            attr: 'atIntelecto' },
    { id: 'ocultismo',       label: 'Ocultismo',            attr: 'atIntelecto' },
    { id: 'percepcao',       label: 'Percepção',            attr: 'atPercepao'  },
    { id: 'persuasao',       label: 'Persuasão',            attr: 'atPresenca'  },
    { id: 'pilotagem',       label: 'Pilotagem',            attr: 'atDestreza'  },
    { id: 'prestidigitacao', label: 'Prestidigitação',      attr: 'atDestreza'  },
    { id: 'sutil',           label: 'Sutil',                attr: 'atAgilidade' },
    { id: 'tecnologia',      label: 'Tecnologia',           attr: 'atIntelecto' },
    { id: 'tratamento',      label: 'Tratamento',           attr: 'atIntelecto' },
    { id: 'veiculos',        label: 'Veículos',             attr: 'atDestreza'  },
];

const ATTR_LABEL = {
    atForca:     'FOR',
    atVigor:     'VIG',
    atAgilidade: 'AGI',
    atDestreza:  'DES',
    atLuta:      'LUT',
    atIntelecto: 'INT',
    atPercepao:  'PER',
    atPresenca:  'PRE',
};

// ─────────────────────────────────────────────
//  ESTADO DA FICHA
// ─────────────────────────────────────────────
const MM_STORAGE_KEY = 'mm_character_active';
const MM_LIST_KEY    = 'mm_character_list';

let mmSaveTimer  = null;
let mmEditMode   = false;

// ─────────────────────────────────────────────
//  UTILITÁRIOS
// ─────────────────────────────────────────────

/** Lê o valor numérico de um input pelo id */
function mmVal(id) { return parseInt(document.getElementById(id)?.value) || 0; }

/** Seta .value em um input/textarea/select */
function mmSet(id, v) { const el = document.getElementById(id); if (el) el.value = v; }

/** Seta textContent em qualquer elemento (display divs, spans, etc.) */
function mmText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }

/** Formata número com sinal */
function mmFmt(n) { return n >= 0 ? `+${n}` : `${n}`; }

// ─────────────────────────────────────────────
//  MODO EDIÇÃO
// ─────────────────────────────────────────────
function mmToggleEdit() {
    mmEditMode = !mmEditMode;
    const editSection    = document.getElementById('editSection');
    const displaySection = document.getElementById('displaySection');
    const btn            = document.getElementById('editToggleBtn');

    if (editSection)    editSection.style.display    = mmEditMode ? 'block' : 'none';
    if (displaySection) displaySection.style.display = mmEditMode ? 'none'  : 'block';
    if (btn) {
        btn.textContent = mmEditMode ? '🔒 Fechar Edição' : '✏️ Editar Ficha';
        btn.className   = mmEditMode ? 'btn btn-danger'   : 'btn btn-secondary';
    }
}

// ─────────────────────────────────────────────
//  CÁLCULOS PRINCIPAIS
// ─────────────────────────────────────────────
function mmCalculateAll() {

    // --- Atributos: rank = modificador no M&M ---
    const attrs = ['Forca','Vigor','Agilidade','Destreza','Luta','Intelecto','Percepao','Presenca'];
    attrs.forEach(a => {
        mmText(`display-mod${a}`, mmFmt(mmVal(`at${a}`)));
    });

    // --- Defesas ---
    const agl            = mmVal('atAgilidade');
    const esquivaRanks   = mmVal('defEsquivaRanks');
    const esquivaMisc    = mmVal('defEsquivaMisc');
    const esquivaTotal   = agl + esquivaRanks + esquivaMisc;

    mmText('display-defEsquivaTotal', mmFmt(esquivaTotal));
    mmText('display-esquiva',         mmFmt(esquivaTotal)); // combate display

    const defFisicaRanks   = mmVal('defFisicaRanks');
    const defFisicaMisc    = mmVal('defFisicaMisc');
    const defFisica        = 10 + defFisicaRanks + defFisicaMisc;
    mmText('display-defFisica', defFisica);

    const defMentalRanks   = mmVal('defMentalRanks');
    const defMentalMisc    = mmVal('defMentalMisc');
    const defMental        = 10 + defMentalRanks + defMentalMisc;
    mmText('display-defMental', defMental);

    const defElementalRanks = mmVal('defElementalRanks');
    const defElementalMisc  = mmVal('defElementalMisc');
    const defElemental      = 10 + defElementalRanks + defElementalMisc;
    mmText('display-defElemental', defElemental);

    const totalDefRanks = esquivaRanks + defFisicaRanks + defMentalRanks + defElementalRanks;

    // --- Vida Máxima (Vigor × 5 + 10) ---
    const vigor              = mmVal('atVigor');
    const vidaMaximaCalc     = Math.max(1, vigor * 5 + 10);
    mmSet('vidaMaxima',  vidaMaximaCalc);
    mmText('display-vidaMaxima', vidaMaximaCalc);

    // --- Perícias base: sincroniza coluna Base e recalcula Total ---
    MM_SKILLS.forEach(s => {
        const attrVal  = mmVal(s.attr);
        const baseEl   = document.getElementById(`skill_base_${s.id}`);
        const ranksEl  = document.getElementById(`skill_ranks_${s.id}`);
        const totalEl  = document.getElementById(`skill_total_${s.id}`);
        if (!ranksEl || !totalEl) return;
        if (baseEl) baseEl.value = attrVal;
        totalEl.value = attrVal + (parseInt(ranksEl.value) || 0);
    });

    // --- Perícias extras ---
    document.querySelectorAll('.mm-extra-skill-row').forEach(row => {
        const attrSel = row.querySelector('.mm-extra-skill-attr');
        const ranksIn = row.querySelector('.mm-extra-skill-ranks');
        const totalIn = row.querySelector('.mm-extra-skill-total');
        if (!attrSel || !ranksIn || !totalIn) return;
        totalIn.value = mmVal(attrSel.value) + (parseInt(ranksIn.value) || 0);
    });

    // --- Pontos e displays ---
    mmCalculatePoints(totalDefRanks);
    mmUpdateDisplays();
}

function mmCalculatePoints(totalDefRanks) {
    const np      = mmVal('nivelPoder');
    const ptLimit = np * 15;
    mmText('display-ptLimit', ptLimit);

    const attrFields = ['atForca','atVigor','atAgilidade','atDestreza','atLuta','atIntelecto','atPercepao','atPresenca'];
    const ptAttrs    = attrFields.reduce((acc, f) => acc + mmVal(f), 0) * 2;
    mmText('display-ptAtributos', ptAttrs);

    mmText('display-ptDefesas', totalDefRanks);

    let totalSkillRanks = 0;
    MM_SKILLS.forEach(s => {
        const el = document.getElementById(`skill_ranks_${s.id}`);
        if (el) totalSkillRanks += parseInt(el.value) || 0;
    });
    document.querySelectorAll('.mm-extra-skill-ranks').forEach(el => {
        totalSkillRanks += parseInt(el.value) || 0;
    });
    const ptSkills = Math.ceil(totalSkillRanks / 2);
    mmText('display-ptPericias', ptSkills);

    const vantCount = document.querySelectorAll('.mm-advantage-row').length;
    mmText('display-ptVantagens', vantCount);

    let ptPow = 0;
    document.querySelectorAll('.mm-power-cost').forEach(el => { ptPow += parseInt(el.value) || 0; });
    mmText('display-ptPoderes', ptPow);

    const gasto    = ptAttrs + totalDefRanks + ptSkills + vantCount + ptPow;
    const restante = ptLimit - gasto;
    mmText('display-ptGasto',    gasto);
    mmText('display-ptRestante', restante);
}

// ─────────────────────────────────────────────
//  SINCRONIZAR DISPLAYS DE TEXTO FIXO
// ─────────────────────────────────────────────
function mmUpdateDisplays() {
    const txt = (id, val) => mmText(id, val || '-');

    txt('display-nomeHeroi',   document.getElementById('nomeHeroi')?.value);
    txt('display-identidade',  document.getElementById('identidade')?.value);
    txt('display-nomeJogador', document.getElementById('nomeJogador')?.value);
    txt('display-grupo',       document.getElementById('grupo')?.value);
    txt('display-base',        document.getElementById('base')?.value);
    txt('display-origem',      document.getElementById('origem')?.value);

    mmText('display-nivelPoder',    mmVal('nivelPoder'));
    mmText('display-pontosHeroicos',mmVal('pontosHeroicos'));
    mmText('display-xp',            mmVal('xp'));

    // Vida
    mmText('display-vidaAtual',      mmVal('vidaAtual'));
    mmText('display-vidaTemporaria', mmVal('vidaTemporaria'));

    // Estado
    const estadoEl = document.getElementById('estado');
    mmText('display-estado', estadoEl?.value || 'Normal');

    // Deslocamentos (sem inputs no momento → mostram 0)
    mmText('display-velocidade', 0);
    mmText('display-voo',        0);
    mmText('display-natacao',    0);
}

// ─────────────────────────────────────────────
//  ATAQUES
// ─────────────────────────────────────────────
let mmAttacks = [];

function mmAddAttack(data = {}) {
    const id = Date.now() + Math.random();
    mmAttacks.push({ id, ...data });
    mmRenderAttacks();
    mmAutoSave();
}

function mmRemoveAttack(id) {
    mmAttacks = mmAttacks.filter(a => a.id !== id);
    mmRenderAttacks();
    mmAutoSave();
}

function mmRenderAttacks() {
    const list = document.getElementById('mmAttackList');
    if (!list) return;
    list.innerHTML = '';
    mmAttacks.forEach(atk => {
        const row = document.createElement('div');
        row.style.cssText = 'display:grid;grid-template-columns:2fr 1fr 1fr 2fr auto;gap:6px;margin-bottom:6px;align-items:center;';
        row.innerHTML = `
            <input type="text" placeholder="Soco, Raio de Fogo..." value="${atk.nome || ''}"
                oninput="mmAttacks.find(a=>a.id==${atk.id}).nome=this.value; mmAutoSave()">
            <input type="number" placeholder="+0" value="${atk.bonus || ''}"
                oninput="mmAttacks.find(a=>a.id==${atk.id}).bonus=this.value; mmAutoSave()"
                style="text-align:center;">
            <input type="text" placeholder="Corpo/Dist." value="${atk.alcance || ''}"
                oninput="mmAttacks.find(a=>a.id==${atk.id}).alcance=this.value; mmAutoSave()">
            <input type="text" placeholder="Dano X / CD X Resistência..." value="${atk.efeito || ''}"
                oninput="mmAttacks.find(a=>a.id==${atk.id}).efeito=this.value; mmAutoSave()">
            <button class="btn btn-danger" style="padding:4px 8px;font-size:0.8em;"
                onclick="mmRemoveAttack(${atk.id})">✕</button>
        `;
        list.appendChild(row);
    });
}

// ─────────────────────────────────────────────
//  PODERES
// ─────────────────────────────────────────────
let mmPowers = [];

function mmAddPower(data = {}) {
    const id = Date.now() + Math.random();
    mmPowers.push({ id, ...data });
    mmRenderPowers();
    mmAutoSave();
}

function mmRemovePower(id) {
    mmPowers = mmPowers.filter(p => p.id !== id);
    mmRenderPowers();
    mmCalculateAll();
    mmAutoSave();
}

function mmRenderPowers() {
    const list = document.getElementById('mmPowersList');
    if (!list) return;
    list.innerHTML = '';
    mmPowers.forEach(pw => {
        const row = document.createElement('div');
        row.style.cssText = 'display:grid;grid-template-columns:2fr 1fr 0.7fr 3fr auto;gap:6px;margin-bottom:6px;align-items:center;';
        row.innerHTML = `
            <input type="text" placeholder="Visão de Raio-X, Voo..." value="${pw.nome || ''}"
                oninput="mmPowers.find(p=>p.id==${pw.id}).nome=this.value; mmAutoSave()">
            <input type="number" placeholder="10" value="${pw.rank || ''}" min="1"
                oninput="mmPowers.find(p=>p.id==${pw.id}).rank=this.value; mmAutoSave()"
                style="text-align:center;">
            <input type="number" placeholder="0" value="${pw.custo || ''}" min="0"
                class="mm-power-cost"
                oninput="mmPowers.find(p=>p.id==${pw.id}).custo=this.value; mmCalculatePoints(mmCurrentDefRanks()); mmAutoSave()"
                style="text-align:center;">
            <input type="text" placeholder="Descritores, extras, limitações..." value="${pw.desc || ''}"
                oninput="mmPowers.find(p=>p.id==${pw.id}).desc=this.value; mmAutoSave()">
            <button class="btn btn-danger" style="padding:4px 8px;font-size:0.8em;"
                onclick="mmRemovePower(${pw.id})">✕</button>
        `;
        list.appendChild(row);
    });
}

function mmCurrentDefRanks() {
    return ['defEsquivaRanks','defFisicaRanks','defMentalRanks','defElementalRanks']
        .reduce((acc, id) => acc + mmVal(id), 0);
}

// ─────────────────────────────────────────────
//  EQUIPAMENTOS
// ─────────────────────────────────────────────
let mmEquip = [];

function mmAddEquip(data = {}) {
    const id = Date.now() + Math.random();
    mmEquip.push({ id, ...data });
    mmRenderEquip();
    mmAutoSave();
}

function mmRemoveEquip(id) {
    mmEquip = mmEquip.filter(e => e.id !== id);
    mmRenderEquip();
    mmAutoSave();
}

function mmRenderEquip() {
    const list = document.getElementById('mmEquipList');
    if (!list) return;
    list.innerHTML = '';
    mmEquip.forEach(eq => {
        const row = document.createElement('div');
        row.style.cssText = 'display:grid;grid-template-columns:2fr 0.8fr 3fr auto;gap:6px;margin-bottom:6px;align-items:center;';
        row.innerHTML = `
            <input type="text" placeholder="Pistola, Armadura..." value="${eq.nome || ''}"
                oninput="mmEquip.find(e=>e.id==${eq.id}).nome=this.value; mmAutoSave()">
            <input type="number" placeholder="1" value="${eq.ep || ''}" min="0"
                oninput="mmEquip.find(e=>e.id==${eq.id}).ep=this.value; mmAutoSave()"
                style="text-align:center;">
            <input type="text" placeholder="Dano, Bônus de Proteção..." value="${eq.props || ''}"
                oninput="mmEquip.find(e=>e.id==${eq.id}).props=this.value; mmAutoSave()">
            <button class="btn btn-danger" style="padding:4px 8px;font-size:0.8em;"
                onclick="mmRemoveEquip(${eq.id})">✕</button>
        `;
        list.appendChild(row);
    });
}

// ─────────────────────────────────────────────
//  VANTAGENS
// ─────────────────────────────────────────────
let mmAdvantages = [];

function mmAddAdvantage(data = {}) {
    const id = Date.now() + Math.random();
    mmAdvantages.push({ id, ...data });
    mmRenderAdvantages();
    mmAutoSave();
}

function mmRemoveAdvantage(id) {
    mmAdvantages = mmAdvantages.filter(a => a.id !== id);
    mmRenderAdvantages();
    mmCalculateAll();
    mmAutoSave();
}

function mmRenderAdvantages() {
    const list = document.getElementById('mmAdvantagesList');
    if (!list) return;
    list.innerHTML = '';
    mmAdvantages.forEach(adv => {
        const row = document.createElement('div');
        row.className = 'mm-advantage-row';
        row.style.cssText = 'display:grid;grid-template-columns:2fr 3fr auto;gap:6px;margin-bottom:6px;align-items:center;';
        row.innerHTML = `
            <input type="text" placeholder="Ataque Poderoso, Esquiva..." value="${adv.nome || ''}"
                oninput="mmAdvantages.find(a=>a.id==${adv.id}).nome=this.value; mmAutoSave()">
            <input type="text" placeholder="Descrição / Ranks..." value="${adv.desc || ''}"
                oninput="mmAdvantages.find(a=>a.id==${adv.id}).desc=this.value; mmAutoSave()">
            <button class="btn btn-danger" style="padding:4px 8px;font-size:0.8em;"
                onclick="mmRemoveAdvantage(${adv.id})">✕</button>
        `;
        list.appendChild(row);
    });
    mmCalculatePoints(mmCurrentDefRanks());
}

// ─────────────────────────────────────────────
//  PERÍCIAS EXTRAS (Especializações)
// ─────────────────────────────────────────────
let mmExtraSkills = [];

function mmAddExtraSkill(data = {}) {
    const id = Date.now() + Math.random();
    mmExtraSkills.push({ id, ...data });
    mmRenderExtraSkills();
    mmAutoSave();
}

function mmRemoveExtraSkill(id) {
    mmExtraSkills = mmExtraSkills.filter(e => e.id !== id);
    mmRenderExtraSkills();
    mmCalculateAll();
    mmAutoSave();
}

function mmRenderExtraSkills() {
    const list = document.getElementById('mmExtraSkillsList');
    if (!list) return;
    list.innerHTML = '';
    mmExtraSkills.forEach(es => {
        const attrOptions = Object.keys(ATTR_LABEL).map(a =>
            `<option value="${a}" ${es.attr === a ? 'selected' : ''}>${ATTR_LABEL[a]}</option>`
        ).join('');

        const row = document.createElement('div');
        row.className = 'mm-extra-skill-row';
        row.style.cssText = 'display:grid;grid-template-columns:2.5fr 0.8fr 0.8fr 0.8fr auto;gap:6px;margin-bottom:6px;align-items:center;';
        row.innerHTML = `
            <input type="text" placeholder="Especialidade (Ciências), Combate (Espada)..." value="${es.nome || ''}"
                oninput="mmExtraSkills.find(e=>e.id==${es.id}).nome=this.value; mmAutoSave()">
            <select class="mm-extra-skill-attr"
                onchange="mmExtraSkills.find(e=>e.id==${es.id}).attr=this.value; mmCalculateAll(); mmAutoSave()">
                ${attrOptions}
            </select>
            <input type="number" class="mm-extra-skill-ranks" placeholder="0" value="${es.ranks || 0}" min="0"
                oninput="mmExtraSkills.find(e=>e.id==${es.id}).ranks=this.value; mmCalculateAll(); mmAutoSave()"
                style="text-align:center;">
            <input type="text" class="mm-extra-skill-total" readonly value="0"
                style="background:var(--cor12);font-weight:700;color:var(--cor19);text-align:center;">
            <button class="btn btn-danger" style="padding:4px 8px;font-size:0.8em;"
                onclick="mmRemoveExtraSkill(${es.id})">✕</button>
        `;
        list.appendChild(row);
    });
    mmCalculateAll();
}

// ─────────────────────────────────────────────
//  COMPLICAÇÕES
// ─────────────────────────────────────────────
let mmComplications = [];

const MM_COMPLICATION_TYPES = [
    'Motivação', 'Inimigo', 'Identidade', 'Relacionamento',
    'Poder Problemático', 'Responsabilidade', 'Reputação', 'Outro'
];

function mmAddComplication(data = {}) {
    const id = Date.now() + Math.random();
    mmComplications.push({ id, ...data });
    mmRenderComplications();
    mmAutoSave();
}

function mmRemoveComplication(id) {
    mmComplications = mmComplications.filter(c => c.id !== id);
    mmRenderComplications();
    mmAutoSave();
}

function mmRenderComplications() {
    const list = document.getElementById('mmComplicationsList');
    if (!list) return;
    list.innerHTML = '';
    mmComplications.forEach(c => {
        const typeOptions = MM_COMPLICATION_TYPES.map(t =>
            `<option value="${t}" ${c.tipo === t ? 'selected' : ''}>${t}</option>`
        ).join('');

        const row = document.createElement('div');
        row.style.cssText = 'display:grid;grid-template-columns:1fr 3fr auto;gap:8px;margin-bottom:8px;align-items:start;';
        row.innerHTML = `
            <select onchange="mmComplications.find(c=>c.id==${c.id}).tipo=this.value; mmAutoSave()">
                ${typeOptions}
            </select>
            <textarea placeholder="Descreva a complicação..." rows="2" style="resize:vertical;"
                oninput="mmComplications.find(c=>c.id==${c.id}).desc=this.value; mmAutoSave()">${c.desc || ''}</textarea>
            <button class="btn btn-danger" style="padding:4px 8px;font-size:0.8em;align-self:center;"
                onclick="mmRemoveComplication(${c.id})">✕</button>
        `;
        list.appendChild(row);
    });
}

// ─────────────────────────────────────────────
//  ALIADOS / CONHECIDOS
// ─────────────────────────────────────────────
let mmIndividuals = [];

function mmAddIndividual(data = {}) {
    const id = Date.now() + Math.random();
    mmIndividuals.push({ id, ...data });
    mmRenderIndividuals();
    mmAutoSave();
}

function mmRemoveIndividual(id) {
    mmIndividuals = mmIndividuals.filter(i => i.id !== id);
    mmRenderIndividuals();
    mmAutoSave();
}

function mmRenderIndividuals() {
    const list = document.getElementById('mmIndividualsList');
    if (!list) return;
    list.innerHTML = '';
    mmIndividuals.forEach(ind => {
        const row = document.createElement('div');
        row.style.cssText = 'display:grid;grid-template-columns:1.5fr 1fr 3fr auto;gap:8px;margin-bottom:8px;align-items:center;';
        row.innerHTML = `
            <input type="text" placeholder="Nome" value="${ind.nome || ''}"
                oninput="mmIndividuals.find(i=>i.id==${ind.id}).nome=this.value; mmAutoSave()">
            <input type="text" placeholder="Aliado / Rival / NPC" value="${ind.relacao || ''}"
                oninput="mmIndividuals.find(i=>i.id==${ind.id}).relacao=this.value; mmAutoSave()">
            <input type="text" placeholder="Notas..." value="${ind.notas || ''}"
                oninput="mmIndividuals.find(i=>i.id==${ind.id}).notas=this.value; mmAutoSave()">
            <button class="btn btn-danger" style="padding:4px 8px;font-size:0.8em;"
                onclick="mmRemoveIndividual(${ind.id})">✕</button>
        `;
        list.appendChild(row);
    });
}

// ─────────────────────────────────────────────
//  RENDERIZAÇÃO DAS PERÍCIAS BASE
// ─────────────────────────────────────────────
function mmRenderBaseSkills() {
    const list = document.getElementById('mmSkillsList');
    if (!list) return;
    list.innerHTML = '';
    MM_SKILLS.forEach(s => {
        const row = document.createElement('div');
        row.style.cssText = 'display:grid;grid-template-columns:2.5fr 0.5fr 0.8fr 0.8fr 0.8fr;gap:6px;margin-bottom:5px;align-items:center;';
        row.innerHTML = `
            <label style="font-size:0.85em;font-weight:600;">${s.label}</label>
            <span style="font-size:0.72em;font-weight:700;color:var(--cor19);opacity:0.75;text-align:center;letter-spacing:0.04em;">${ATTR_LABEL[s.attr] ?? s.attr}</span>
            <input type="text" id="skill_base_${s.id}" readonly value="0"
                style="background:var(--cor12);font-weight:700;color:var(--cor19);text-align:center;padding:3px;border-radius:4px;">
            <input type="number" id="skill_ranks_${s.id}" value="0" min="0"
                oninput="mmCalculateAll(); mmAutoSave()"
                style="text-align:center;padding:3px;border-radius:4px;">
            <input type="text" id="skill_total_${s.id}" readonly value="0"
                style="background:var(--cor12);font-weight:700;color:var(--cor19);text-align:center;padding:3px;border-radius:4px;">
        `;
        list.appendChild(row);
    });
}

// ─────────────────────────────────────────────
//  IMAGEM DO PERSONAGEM
// ─────────────────────────────────────────────
function mmSetupImageUpload() {
    const upload = document.getElementById('imageUpload');
    if (!upload) return;
    upload.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (ev) {
            const img         = document.getElementById('characterImage');
            const placeholder = document.getElementById('imagePlaceholder');
            const removeBtn   = document.getElementById('removeImageBtn');
            if (img)         { img.src = ev.target.result; img.style.display = 'block'; }
            if (placeholder)   placeholder.style.display = 'none';
            if (removeBtn)     removeBtn.style.display = 'inline-block';
            mmAutoSave();
        };
        reader.readAsDataURL(file);
    });

    const preview = document.getElementById('imagePreview');
    if (preview) preview.addEventListener('click', () => upload.click());
}

function mmRemoveImage() {
    const img         = document.getElementById('characterImage');
    const placeholder = document.getElementById('imagePlaceholder');
    const removeBtn   = document.getElementById('removeImageBtn');
    if (img)         { img.src = ''; img.style.display = 'none'; }
    if (placeholder)   placeholder.style.display = 'flex';
    if (removeBtn)     removeBtn.style.display = 'none';
    mmAutoSave();
}

// ─────────────────────────────────────────────
//  SALVAR / CARREGAR
// ─────────────────────────────────────────────
function mmCollectData() {
    const img = document.getElementById('characterImage');
    const data = {
        nomeHeroi:    document.getElementById('nomeHeroi')?.value    || '',
        identidade:   document.getElementById('identidade')?.value   || '',
        nomeJogador:  document.getElementById('nomeJogador')?.value  || '',
        grupo:        document.getElementById('grupo')?.value        || '',
        base:         document.getElementById('base')?.value         || '',
        origem:       document.getElementById('origem')?.value       || '',
        nivelPoder:   mmVal('nivelPoder'),
        pontosHeroicos: mmVal('pontosHeroicos'),
        xp:           mmVal('xp'),

        vidaMaxima:   mmVal('vidaMaxima'),
        vidaAtual:    mmVal('vidaAtual'),
        vidaTemporaria: mmVal('vidaTemporaria'),

        atForca:      mmVal('atForca'),
        atVigor:      mmVal('atVigor'),
        atAgilidade:  mmVal('atAgilidade'),
        atDestreza:   mmVal('atDestreza'),
        atLuta:       mmVal('atLuta'),
        atIntelecto:  mmVal('atIntelecto'),
        atPercepao:   mmVal('atPercepao'),
        atPresenca:   mmVal('atPresenca'),

        defEsquivaRanks:  mmVal('defEsquivaRanks'),  defEsquivaMisc:    mmVal('defEsquivaMisc'),
        defFisicaRanks:   mmVal('defFisicaRanks'),   defFisicaMisc:     mmVal('defFisicaMisc'),
        defMentalRanks:   mmVal('defMentalRanks'),   defMentalMisc:     mmVal('defMentalMisc'),
        defElementalRanks:mmVal('defElementalRanks'),defElementalMisc:  mmVal('defElementalMisc'),

        extraBonusCC:   mmVal('extraBonusCC'),
        extraBonusDist: mmVal('extraBonusDist'),

        estado: document.getElementById('estado')?.value || 'Normal',

        skills: {},
        extraSkills:    mmExtraSkills,
        attacks:        mmAttacks,
        powers:         mmPowers,
        equip:          mmEquip,
        advantages:     mmAdvantages,
        complications:  mmComplications,
        individuals:    mmIndividuals,

        mmIdiomas:     document.getElementById('mmIdiomas')?.value    || '',
        mmVeiculosQG:  document.getElementById('mmVeiculosQG')?.value || '',

        idade:        document.getElementById('idade')?.value        || '',
        altura:       document.getElementById('altura')?.value       || '',
        peso:         document.getElementById('peso')?.value         || '',
        olhos:        document.getElementById('olhos')?.value        || '',
        cabelo:       document.getElementById('cabelo')?.value       || '',
        genero:       document.getElementById('genero')?.value       || '',
        aparencia:    document.getElementById('aparencia')?.value    || '',
        personalidade:document.getElementById('personalidade')?.value|| '',
        motivacao:    document.getElementById('motivacao')?.value    || '',
        historia:     document.getElementById('historia')?.value     || '',
        anotacoes:    document.getElementById('anotacoes')?.value    || '',

        characterImage: img?.src && img.src !== window.location.href ? img.src : '',
    };

    MM_SKILLS.forEach(s => {
        const el = document.getElementById(`skill_ranks_${s.id}`);
        if (el) data.skills[s.id] = parseInt(el.value) || 0;
    });

    return data;
}

function mmApplyData(data) {
    if (!data) return;

    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };

    setVal('nomeHeroi',      data.nomeHeroi);
    setVal('identidade',     data.identidade);
    setVal('nomeJogador',    data.nomeJogador);
    setVal('grupo',          data.grupo);
    setVal('base',           data.base);
    setVal('origem',         data.origem);
    setVal('nivelPoder',     data.nivelPoder     ?? 10);
    setVal('pontosHeroicos', data.pontosHeroicos ?? 1);
    setVal('xp',             data.xp             ?? 0);

    setVal('vidaAtual',      data.vidaAtual      ?? 10);
    setVal('vidaTemporaria', data.vidaTemporaria ?? 0);

    setVal('atForca',     data.atForca     ?? 0);
    setVal('atVigor',     data.atVigor     ?? 0);
    setVal('atAgilidade', data.atAgilidade ?? 0);
    setVal('atDestreza',  data.atDestreza  ?? 0);
    setVal('atLuta',      data.atLuta      ?? 0);
    setVal('atIntelecto', data.atIntelecto ?? 0);
    setVal('atPercepao',  data.atPercepao  ?? 0);
    setVal('atPresenca',  data.atPresenca  ?? 0);

    setVal('defEsquivaRanks',   data.defEsquivaRanks   ?? 0);
    setVal('defEsquivaMisc',    data.defEsquivaMisc    ?? 0);
    setVal('defFisicaRanks',    data.defFisicaRanks    ?? 0);
    setVal('defFisicaMisc',     data.defFisicaMisc     ?? 0);
    setVal('defMentalRanks',    data.defMentalRanks    ?? 0);
    setVal('defMentalMisc',     data.defMentalMisc     ?? 0);
    setVal('defElementalRanks', data.defElementalRanks ?? 0);
    setVal('defElementalMisc',  data.defElementalMisc  ?? 0);

    // Compatibilidade com fichas antigas
    if (data.defFortRanks    !== undefined) setVal('defMentalRanks',    data.defFortRanks);
    if (data.defFortMisc     !== undefined) setVal('defMentalMisc',     data.defFortMisc);
    if (data.defApararRanks  !== undefined) setVal('defFisicaRanks',    data.defApararRanks);
    if (data.defApararMisc   !== undefined) setVal('defFisicaMisc',     data.defApararMisc);
    if (data.defResistRanks  !== undefined) setVal('defElementalRanks', data.defResistRanks);
    if (data.defResistMisc   !== undefined) setVal('defElementalMisc',  data.defResistMisc);

    setVal('extraBonusCC',   data.extraBonusCC   ?? 0);
    setVal('extraBonusDist', data.extraBonusDist ?? 0);

    const estadoEl = document.getElementById('estado');
    if (estadoEl && data.estado) estadoEl.value = data.estado;

    if (data.skills) {
        MM_SKILLS.forEach(s => {
            const el = document.getElementById(`skill_ranks_${s.id}`);
            if (el) el.value = data.skills[s.id] ?? 0;
        });
    }

    mmExtraSkills   = data.extraSkills   || [];
    mmAttacks       = data.attacks       || [];
    mmPowers        = data.powers        || [];
    mmEquip         = data.equip         || [];
    mmAdvantages    = data.advantages    || [];
    mmComplications = data.complications || [];
    mmIndividuals   = data.individuals   || [];

    mmRenderExtraSkills();
    mmRenderAttacks();
    mmRenderPowers();
    mmRenderEquip();
    mmRenderAdvantages();
    mmRenderComplications();
    mmRenderIndividuals();

    setVal('mmIdiomas',     data.mmIdiomas);
    setVal('mmVeiculosQG',  data.mmVeiculosQG);
    setVal('idade',         data.idade);
    setVal('altura',        data.altura);
    setVal('peso',          data.peso);
    setVal('olhos',         data.olhos);
    setVal('cabelo',        data.cabelo);
    setVal('genero',        data.genero);
    setVal('aparencia',     data.aparencia);
    setVal('personalidade', data.personalidade);
    setVal('motivacao',     data.motivacao);
    setVal('historia',      data.historia);
    setVal('anotacoes',     data.anotacoes);

    if (data.characterImage) {
        const img         = document.getElementById('characterImage');
        const placeholder = document.getElementById('imagePlaceholder');
        const removeBtn   = document.getElementById('removeImageBtn');
        if (img)         { img.src = data.characterImage; img.style.display = 'block'; }
        if (placeholder)   placeholder.style.display = 'none';
        if (removeBtn)     removeBtn.style.display = 'inline-block';
    }

    mmCalculateAll();
}

// ─────────────────────────────────────────────
//  AUTO-SAVE
// ─────────────────────────────────────────────
function mmSave() {
    const data = mmCollectData();
    localStorage.setItem(MM_STORAGE_KEY, JSON.stringify(data));

    let list = JSON.parse(localStorage.getItem(MM_LIST_KEY) || '[]');
    const nome  = data.nomeHeroi || 'Herói sem nome';
    const idx   = list.findIndex(c => c.nome === nome);
    const entry = { nome, timestamp: Date.now(), data };
    if (idx >= 0) list[idx] = entry; else list.push(entry);
    localStorage.setItem(MM_LIST_KEY, JSON.stringify(list));

    const ind = document.getElementById('saveIndicator');
    if (ind) { ind.style.opacity = '1'; setTimeout(() => ind.style.opacity = '0', 2000); }
}

function mmAutoSave() {
    clearTimeout(mmSaveTimer);
    mmSaveTimer = setTimeout(mmSave, 800);
}

function mmLoad() {
    const raw = localStorage.getItem(MM_STORAGE_KEY);
    if (raw) {
        try { mmApplyData(JSON.parse(raw)); } catch (e) { console.warn('Erro ao carregar ficha M&M', e); }
    } else {
        mmCalculateAll();
    }
}

function mmNewSheet() {
    if (!confirm('Criar nova ficha? Os dados não salvos serão perdidos.')) return;
    localStorage.removeItem(MM_STORAGE_KEY);
    mmAttacks = []; mmPowers = []; mmEquip = []; mmAdvantages = [];
    mmComplications = []; mmIndividuals = []; mmExtraSkills = [];
    mmApplyData({});
    document.querySelectorAll('input:not([readonly]), textarea, select').forEach(el => {
        if (el.type === 'number') el.value = el.getAttribute('value') || 0;
        else if (el.tagName === 'SELECT') el.selectedIndex = 0;
        else if (el.tagName !== 'BUTTON') el.value = '';
    });
    mmCalculateAll();
}

// ─────────────────────────────────────────────
//  EXPORT / IMPORT JSON
// ─────────────────────────────────────────────
function mmExportJSON() {
    const data = mmCollectData();
    const nome = data.nomeHeroi?.replace(/\s+/g, '_') || 'heroi';
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `mm_${nome}.json`; a.click();
    URL.revokeObjectURL(url);
}

function mmImportJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            mmApplyData(data);
            mmSave();
        } catch (err) {
            alert('Erro ao importar ficha. Verifique o arquivo JSON.');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// ─────────────────────────────────────────────
//  MODAL DE CARREGAR
// ─────────────────────────────────────────────
function mmShowLoadModal() {
    const modal  = document.getElementById('loadModal');
    const listEl = document.getElementById('mmCharacterList');
    if (!modal || !listEl) return;

    const list = JSON.parse(localStorage.getItem(MM_LIST_KEY) || '[]');
    listEl.innerHTML = '';

    if (!list.length) {
        listEl.innerHTML = '<p style="text-align:center;opacity:0.6;">Nenhuma ficha salva.</p>';
    } else {
        list.slice().reverse().forEach(entry => {
            const date = new Date(entry.timestamp).toLocaleString('pt-BR');
            const row  = document.createElement('div');
            row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid var(--cor10,#ccc);gap:8px;';
            row.innerHTML = `
                <div>
                    <strong>${entry.nome}</strong>
                    <div style="font-size:0.75em;opacity:0.6;">${date}</div>
                </div>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-secondary" onclick="mmLoadEntry('${entry.nome}')">Carregar</button>
                    <button class="btn btn-danger" onclick="mmDeleteEntry('${entry.nome}')">Excluir</button>
                </div>
            `;
            listEl.appendChild(row);
        });
    }

    modal.style.display = 'flex';
}

function mmHideLoadModal() {
    const modal = document.getElementById('loadModal');
    if (modal) modal.style.display = 'none';
}

function mmLoadEntry(nome) {
    const list  = JSON.parse(localStorage.getItem(MM_LIST_KEY) || '[]');
    const entry = list.find(c => c.nome === nome);
    if (!entry) return;
    mmApplyData(entry.data);
    localStorage.setItem(MM_STORAGE_KEY, JSON.stringify(entry.data));
    mmHideLoadModal();
}

function mmDeleteEntry(nome) {
    if (!confirm(`Excluir a ficha "${nome}"?`)) return;
    let list = JSON.parse(localStorage.getItem(MM_LIST_KEY) || '[]');
    list = list.filter(c => c.nome !== nome);
    localStorage.setItem(MM_LIST_KEY, JSON.stringify(list));
    mmShowLoadModal();
}

// ─────────────────────────────────────────────
//  SISTEMA DE ABAS
// ─────────────────────────────────────────────
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const tab = document.getElementById(tabId);
    if (tab) tab.classList.add('active');
    const idx  = parseInt(tabId.replace('tab','')) - 1;
    const btns = document.querySelectorAll('.tab-btn');
    if (btns[idx]) btns[idx].classList.add('active');
}

// ─────────────────────────────────────────────
//  DARK MODE
// ─────────────────────────────────────────────
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('mm_darkMode', document.body.classList.contains('dark-mode'));
}

// ─────────────────────────────────────────────
//  INICIALIZAÇÃO
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    mmRenderBaseSkills();
    mmLoad();
    mmSetupImageUpload();

    if (localStorage.getItem('mm_darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        const cb = document.getElementById('toggleDarkMode');
        if (cb) cb.checked = true;
    }

    window.addEventListener('click', function (e) {
        const modal = document.getElementById('loadModal');
        if (modal && e.target === modal) mmHideLoadModal();
    });
});