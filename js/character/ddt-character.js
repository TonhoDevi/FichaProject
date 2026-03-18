// ================================================================
//  character-all.js  —  Ficha D&D 5e  (arquivo único)
//  Substitui: character.js, main.js, spells.js,
//             inventory.js, individuals.js, habilits.js
//
//  Depende de (carregar ANTES no HTML):
//    1. supabase CDN
//    2. supabase-auth.js
//    3. cloud-save.js
// ================================================================

'use strict';

// ================================================================
//  DADOS DAS PERÍCIAS
// ================================================================
const SKILLS = [
    { name: 'Acrobacia',         attr: 'destreza'     },
    { name: 'Arcanismo',         attr: 'inteligencia' },
    { name: 'Atletismo',         attr: 'forca'        },
    { name: 'Atuacao',           attr: 'carisma'      },
    { name: 'Blefar',            attr: 'carisma'      },
    { name: 'Briga',             attr: 'forca'        },
    { name: 'Brutalidade',       attr: 'forca'        },
    { name: 'Furtividade',       attr: 'destreza'     },
    { name: 'Historia',          attr: 'inteligencia' },
    { name: 'Intimidacao',       attr: 'carisma'      },
    { name: 'Intuicao',          attr: 'sabedoria'    },
    { name: 'Investigacao',      attr: 'inteligencia' },
    { name: 'Lidar com Animais', attr: 'sabedoria'    },
    { name: 'Medicina',          attr: 'sabedoria'    },
    { name: 'Natureza',          attr: 'inteligencia' },
    { name: 'Percepcao',         attr: 'sabedoria'    },
    { name: 'Persuasao',         attr: 'carisma'      },
    { name: 'Prestidigitacao',   attr: 'destreza'     },
    { name: 'Religiao',          attr: 'inteligencia' },
    { name: 'Resiliencia',       attr: 'constituicao' },
    { name: 'Sobrevivencia',     attr: 'sabedoria'    },
    { name: 'Vigor',             attr: 'constituicao' },
];

// ================================================================
//  VARIÁVEIS GLOBAIS
// ================================================================
let skillProficiencies  = {};
let attacks             = [];
let characterImageData  = null;
let inventoryItems      = [];
let magicItems          = [];
let individualsUnit     = [];
let abilities           = [];
let spells = {
    truques: [], nivel1: [], nivel2: [], nivel3: [], nivel4: [],
    nivel5: [],  nivel6: [], nivel7: [], nivel8: [], nivel9: []
};
let _autoSaveTimer = null;

// ================================================================
//  INICIALIZAÇÃO DAS PERÍCIAS
// ================================================================
function initSkills() {
    const list = document.getElementById('skillsList');
    if (!list) return;
    list.innerHTML = '';
    SKILLS.forEach(skill => {
        const div = document.createElement('div');
        div.className = 'character-skill-item';
        div.innerHTML = `
            <select class="character-skill-prof-select" id="skillProf_${skill.name}"
                onchange="updateSkillProf('${skill.name}', this.value)">
                <option value="none">-</option>
                <option value="proficient">Prof</option>
                <option value="expert">Esp</option>
            </select>
            <span class="character-skill-name">${skill.name}</span>
            <span class="character-skill-value" id="skillValue_${skill.name}">+0</span>`;
        list.appendChild(div);
    });
}

// ================================================================
//  CÁLCULOS DE ATRIBUTOS
// ================================================================
function getModifier(score) { return Math.floor((score - 10) / 2); }

function calculateModifiers() {
    ['forca','destreza','constituicao','inteligencia','sabedoria','carisma'].forEach(attr => {
        const value = parseInt(document.getElementById(attr).value) || 10;
        const mod   = getModifier(value);
        document.getElementById(`${attr}Mod`).textContent = mod >= 0 ? `+${mod}` : `${mod}`;
    });
    calculateSavingThrows();
    calculateSkills();
    calculateMagicBonus();
    calculateMagicCd();
    autoSave();
}

function calculateSavingThrows() {
    const profBonus = parseInt(document.getElementById('bonusProficiencia').value) || 1;
    ['forca','destreza','constituicao','inteligencia','sabedoria','carisma'].forEach(attr => {
        const value      = parseInt(document.getElementById(attr).value) || 10;
        const mod        = getModifier(value);
        const checkboxId = `prof${attr.charAt(0).toUpperCase() + attr.slice(1)}`;
        const checkbox   = document.getElementById(checkboxId);
        const proficient = checkbox.checked;
        checkbox.closest('.character-attribute-box')?.classList.toggle('proficient', proficient);
        const save = mod + (proficient ? profBonus : 0);
        document.getElementById(`${attr}Save`).textContent = save >= 0 ? `+${save}` : `${save}`;
    });
}

// ================================================================
//  PERÍCIAS
// ================================================================
function calculateSkills() {
    const profBonus = parseInt(document.getElementById('bonusProficiencia').value) || 2;
    SKILLS.forEach(skill => {
        const attrMod  = getModifier(parseInt(document.getElementById(skill.attr).value) || 10);
        const prof     = skillProficiencies[skill.name] || 'none';
        let bonus      = attrMod;
        if (prof === 'proficient') bonus += profBonus;
        if (prof === 'expert')     bonus += profBonus * 2;
        document.getElementById(`skillValue_${skill.name}`).textContent = bonus >= 0 ? `+${bonus}` : `${bonus}`;
    });

    const sabMod       = getModifier(parseInt(document.getElementById('sabedoria').value) || 10);
    const percProf     = skillProficiencies['Percepcao'] || 'none';
    let percBonus      = sabMod;
    if (percProf === 'proficient') percBonus += profBonus;
    if (percProf === 'expert')     percBonus += profBonus * 2;
    document.getElementById('percepcaoPassiva').value = 10 + percBonus;

    const intProf  = skillProficiencies['Intuicao'] || 'none';
    let intBonus   = sabMod;
    if (intProf === 'proficient') intBonus += profBonus;
    if (intProf === 'expert')     intBonus += profBonus * 2;
    document.getElementById('intuicaoPassiva').value = 10 + intBonus;
}

function updateSkillProf(skillName, level) {
    skillProficiencies[skillName] = level;
    calculateSkills();
    autoSave();
}

// ================================================================
//  MAGIA
// ================================================================
function updateMagicAtribute() { calculateMagicBonus(); calculateMagicCd(); }

function calculateMagicCd() {
    const prof  = parseInt(document.getElementById('bonusProficiencia').value) || 2;
    const hab   = document.getElementById('habilidadeMagia').value;
    const attr  = hab ? parseInt(document.getElementById(hab).value) || 10 : 10;
    const extra = parseInt(document.getElementById('extraBonusMagia').value) || 0;
    document.getElementById('cdMagia').value = 8 + prof + getModifier(attr) + extra;
}

function calculateMagicBonus() {
    const prof  = parseInt(document.getElementById('bonusProficiencia').value) || 2;
    const hab   = document.getElementById('habilidadeMagia').value;
    const attr  = hab ? parseInt(document.getElementById(hab).value) || 10 : 10;
    const extra = parseInt(document.getElementById('extraBonusMagia').value) || 0;
    const total = prof + getModifier(attr) + extra;
    document.getElementById('bonusMagia').value = total >= 0 ? `+${total}` : `${total}`;
}

// ================================================================
//  ATAQUES
// ================================================================
function renderAttacks() {
    const list = document.getElementById('attackList');
    if (!list) return;
    list.innerHTML = '';
    attacks.forEach((atk, i) => {
        const div = document.createElement('div');
        div.className = 'attack-item';
        div.innerHTML = `
            <input type="text" placeholder="Nome" value="${atk.nome}"
                oninput="attacks[${i}].nome=this.value; autoSave()">
            <input type="text" placeholder="Bonus" value="${atk.bonus}"
                oninput="attacks[${i}].bonus=this.value; autoSave()">
            <input type="text" placeholder="Dano" value="${atk.dano}"
                oninput="attacks[${i}].dano=this.value; autoSave()">
            <button class="delete-btn" onclick="removeAttack(${i})">X</button>`;
        list.appendChild(div);
    });
}
function addAttack()                { attacks.push({nome:'',bonus:'',dano:''}); renderAttacks(); autoSave(); }
function removeAttack(i)            { attacks.splice(i,1); renderAttacks(); autoSave(); }
function updateAttack(i,field,val)  { attacks[i][field]=val; autoSave(); }

// ================================================================
//  IMAGEM
// ================================================================
function setupImageUpload() {
    const upload  = document.getElementById('imageUpload');
    const preview = document.getElementById('imagePreview');
    if (upload)  upload.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => { characterImageData = ev.target.result; displayCharacterImage(characterImageData); autoSave(); };
        reader.readAsDataURL(file);
    });
    if (preview) preview.addEventListener('click', () => upload.click());
}

function displayCharacterImage(data) {
    const img = document.getElementById('characterImage');
    const ph  = document.getElementById('imagePlaceholder');
    const btn = document.getElementById('removeImageBtn');
    if (data) {
        if (img) { img.src = data; img.style.display = 'block'; }
        if (ph)  ph.style.display  = 'none';
        if (btn) btn.style.display = 'inline-block';
    } else {
        if (img) img.style.display = 'none';
        if (ph)  ph.style.display  = 'flex';
        if (btn) btn.style.display = 'none';
    }
}

function removeCharacterImage() {
    if (!confirm('Deseja remover a imagem?')) return;
    characterImageData = null;
    displayCharacterImage(null);
    const u = document.getElementById('imageUpload');
    if (u) u.value = '';
    autoSave();
}

// ================================================================
//  INVENTÁRIO
// ================================================================
function renderInventory() {
    const list = document.getElementById('inventoryList');
    if (!list) return;
    list.innerHTML = '';
    inventoryItems.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'inventory-item';
        div.innerHTML = `
            <input type="number" placeholder="Qtd" value="${item.quantidade}" min="0"
                oninput="inventoryItems[${i}].quantidade=this.value; autoSave()">
            <input type="text" placeholder="Nome do item" value="${item.nome}"
                oninput="inventoryItems[${i}].nome=this.value; autoSave()">
            <button class="delete-btn" onclick="removeInventoryItem(${i})">X</button>`;
        list.appendChild(div);
    });
}
function addInventoryItem()      { inventoryItems.push({quantidade:1,nome:''}); renderInventory(); autoSave(); }
function removeInventoryItem(i)  { inventoryItems.splice(i,1); renderInventory(); autoSave(); }
function updateInventoryItem(i,f,v){ inventoryItems[i][f]=v; autoSave(); }

// ================================================================
//  ITENS MÁGICOS
// ================================================================
function renderMagicItems() {
    const list = document.getElementById('magicItemsList');
    if (!list) return;
    list.innerHTML = '';
    magicItems.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'magic-item';
        div.innerHTML = `
            <div class="magic-item-header">
                <input type="text" placeholder="Nome do item magico" value="${item.nome}"
                    oninput="magicItems[${i}].nome=this.value; autoSave()" onclick="event.stopPropagation()">
                <div class="magic-item-sync" onclick="event.stopPropagation()">
                    <input type="checkbox" id="magicSync${i}" ${item.sincronizado?'checked':''}
                        onchange="magicItems[${i}].sincronizado=this.checked; autoSave()">
                </div>
                <button class="magic-item-expand ${item.expanded?'active':''}"
                    onclick="toggleMagicItemDescription(${i})">▼</button>
            </div>
            <div class="magic-item-description ${item.expanded?'active':''}" id="magicDesc${i}">
                <div class="magic-item-description-content">
                    <textarea placeholder="Descricao do item..."
                        oninput="magicItems[${i}].descricao=this.value; autoSave()">${item.descricao||''}</textarea>
                </div>
                <div class="magic-item-actions">
                    <button class="delete-btn" onclick="removeMagicItem(${i})">Excluir Item</button>
                </div>
            </div>`;
        list.appendChild(div);
    });
}
function addMagicItem()             { magicItems.push({nome:'',descricao:'',sincronizado:false,expanded:false}); renderMagicItems(); autoSave(); }
function removeMagicItem(i)         { if(confirm('Excluir item magico?')){ magicItems.splice(i,1); renderMagicItems(); autoSave(); } }
function updateMagicItem(i,f,v)     { magicItems[i][f]=v; autoSave(); }
function toggleMagicItemDescription(i){ magicItems[i].expanded=!magicItems[i].expanded; renderMagicItems(); }

// ================================================================
//  MAGIAS
// ================================================================
function toggleSpellLevel(level) {
    const key = level.charAt(0).toUpperCase() + level.slice(1);
    document.getElementById(`spells${key}`)?.classList.toggle('active');
    document.getElementById(`expand${key}`)?.classList.toggle('active');
}

function renderSpells() {
    Object.keys(spells).forEach(level => {
        const key  = level.charAt(0).toUpperCase() + level.slice(1);
        const list = document.getElementById(`spellList${key}`);
        if (!list) return;
        list.innerHTML = '';
        spells[level].forEach((spell, i) => {
            const div = document.createElement('div');
            div.className = 'spell-card';
            div.innerHTML = `
                <div class="spell-card-header">
                    <input type="text" placeholder="Nome da magia" value="${spell.nome}"
                        oninput="updateSpell('${level}',${i},'nome',this.value)" onclick="event.stopPropagation()">
                    <button class="spell-card-expand ${spell.expanded?'active':''}"
                        onclick="toggleSpellDetails('${level}',${i})">▼</button>
                </div>
                <div class="spell-card-details ${spell.expanded?'active':''}" id="spellDetails${level}${i}">
                    <div class="spell-details-content">
                        <div class="spell-details-row">
                            <div class="input-group">
                                <label class="input-label">Tempo de Conjuracao</label>
                                <input type="text" placeholder="Ex: 1 acao" value="${spell.tempo||''}"
                                    oninput="updateSpell('${level}',${i},'tempo',this.value)">
                            </div>
                            <div class="input-group">
                                <label class="input-label">Duracao</label>
                                <input type="text" placeholder="Ex: 1 minuto" value="${spell.duracao||''}"
                                    oninput="updateSpell('${level}',${i},'duracao',this.value)">
                            </div>
                        </div>
                        <div class="concentration-check">
                            <input type="checkbox" id="conc${level}${i}" ${spell.concentracao?'checked':''}
                                onchange="updateSpell('${level}',${i},'concentracao',this.checked)">
                            <label for="conc${level}${i}">Requer Concentracao</label>
                        </div>
                        <div class="input-group">
                            <label class="input-label">Componentes</label>
                            <div class="spell-components">
                                <div class="component-check">
                                    <input type="checkbox" id="compV${level}${i}" ${spell.componenteV?'checked':''}
                                        onchange="updateSpell('${level}',${i},'componenteV',this.checked)">
                                    <label for="compV${level}${i}">V (Verbal)</label>
                                </div>
                                <div class="component-check">
                                    <input type="checkbox" id="compS${level}${i}" ${spell.componenteS?'checked':''}
                                        onchange="updateSpell('${level}',${i},'componenteS',this.checked)">
                                    <label for="compS${level}${i}">S (Somatico)</label>
                                </div>
                            </div>
                        </div>
                        <div class="input-group">
                            <label class="input-label">Descricao</label>
                            <textarea class="spell-description" placeholder="Efeitos da magia..."
                                oninput="updateSpell('${level}',${i},'descricao',this.value)">${spell.descricao||''}</textarea>
                        </div>
                    </div>
                    <div class="spell-card-actions">
                        <button class="delete-btn" onclick="removeSpell('${level}',${i})">Excluir</button>
                    </div>
                </div>`;
            list.appendChild(div);
        });
    });
}

function addSpell(level)                   { spells[level].push({nome:'',tempo:'',duracao:'',concentracao:false,componenteV:false,componenteS:false,descricao:'',expanded:false}); renderSpells(); autoSave(); }
function updateSpell(level,i,field,value)  { spells[level][i][field]=value; autoSave(); }
function toggleSpellDetails(level,i)       { spells[level][i].expanded=!spells[level][i].expanded; renderSpells(); }
function removeSpell(level,i)              { if(confirm('Excluir esta magia?')){ spells[level].splice(i,1); renderSpells(); autoSave(); } }

// ================================================================
//  INDIVIDUAIS (CONHECIDOS)
// ================================================================
function renderIndiduals() {
    const list = document.getElementById('individualsList');
    if (!list) return;
    list.innerHTML = '';
    individualsUnit.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'individuals-unit';
        div.innerHTML = `
            <div class="individuals-unit-header">
                <input type="text" placeholder="Nome do individuo" value="${item.nome}"
                    oninput="individualsUnit[${i}].nome=this.value; autoSave()" onclick="event.stopPropagation()">
                <button class="individuals-unit-expand ${item.expanded?'active':''}"
                    onclick="toggleIndividualDescription(${i})">▼</button>
            </div>
            <div class="individuals-unit-description ${item.expanded?'active':''}" id="individualsDesc${i}">
                <div class="individuals-unit-description-content">
                    <textarea placeholder="Descricao..." oninput="individualsUnit[${i}].descricao=this.value; autoSave()">${item.descricao||''}</textarea>
                </div>
                <div class="individuals-unit-actions">
                    <button class="delete-btn" onclick="removeIndividual(${i})">X Excluir</button>
                </div>
            </div>`;
        list.appendChild(div);
    });
}
function addIndividual()              { individualsUnit.push({nome:'',descricao:'',expanded:false}); renderIndiduals(); autoSave(); }
function removeIndividual(i)          { if(confirm('Excluir individuo?')){ individualsUnit.splice(i,1); renderIndiduals(); autoSave(); } }
function updateIndividual(i,f,v)      { individualsUnit[i][f]=v; autoSave(); }
function toggleIndividualDescription(i){ individualsUnit[i].expanded=!individualsUnit[i].expanded; renderIndiduals(); }

// ================================================================
//  HABILIDADES / CARACTERÍSTICAS
// ================================================================
function renderAbilities() {
    const list = document.getElementById('abilitiesList');
    if (!list) return;
    list.innerHTML = '';
    abilities.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'individuals-unit';
        div.innerHTML = `
            <div class="individuals-unit-header">
                <input type="text" placeholder="Nome da habilidade" value="${item.nome}"
                    oninput="abilities[${i}].nome=this.value; autoSave()" onclick="event.stopPropagation()">
                <input type="number" class="ability-uses" placeholder="Usos" value="${item.usos||''}"
                    oninput="abilities[${i}].usos=this.value; autoSave()" onclick="event.stopPropagation()"
                    style="width:60px;margin-left:10px;">
                <button class="individuals-unit-expand ${item.expanded?'active':''}"
                    onclick="toggleAbilityDescription(${i})">▼</button>
            </div>
            <div class="individuals-unit-description ${item.expanded?'active':''}" id="abilityDesc${i}">
                <div class="individuals-unit-description-content">
                    <textarea placeholder="Descricao da habilidade..."
                        oninput="abilities[${i}].descricao=this.value; autoSave()">${item.descricao||''}</textarea>
                </div>
                <div class="individuals-unit-actions">
                    <button class="delete-btn" onclick="removeAbility(${i})">X Excluir Habilidade</button>
                </div>
            </div>`;
        list.appendChild(div);
    });
}
function addAbility()              { abilities.push({nome:'',usos:'',descricao:'',expanded:false}); renderAbilities(); autoSave(); }
function removeAbility(i)          { if(confirm('Excluir habilidade?')){ abilities.splice(i,1); renderAbilities(); autoSave(); } }
function updateAbility(i,f,v)      { abilities[i][f]=v; autoSave(); }
function toggleAbilityDescription(i){ abilities[i].expanded=!abilities[i].expanded; renderAbilities(); }

// ================================================================
//  COLETAR / APLICAR DADOS
// ================================================================
function getCurrentCharacter() {
    return {
        nomePersonagem:  document.getElementById('nomePersonagem').value,
        nomeJogador:     document.getElementById('nomeJogador').value,
        classeNivel:     document.getElementById('classeNivel').value,
        raca:            document.getElementById('raca').value,
        antecedente:     document.getElementById('antecedente').value,
        tendencia:       document.getElementById('tendencia').value,
        inspiracao:      document.getElementById('inspiracao').checked,
        pontoHeroico:    document.getElementById('pontoHeroico').checked,
        forca:           document.getElementById('forca').value,
        destreza:        document.getElementById('destreza').value,
        constituicao:    document.getElementById('constituicao').value,
        inteligencia:    document.getElementById('inteligencia').value,
        sabedoria:       document.getElementById('sabedoria').value,
        carisma:         document.getElementById('carisma').value,
        profForca:       document.getElementById('profForca').checked,
        profDestreza:    document.getElementById('profDestreza').checked,
        profConstituicao:document.getElementById('profConstituicao').checked,
        profInteligencia:document.getElementById('profInteligencia').checked,
        profSabedoria:   document.getElementById('profSabedoria').checked,
        profCarisma:     document.getElementById('profCarisma').checked,
        bonusProficiencia:document.getElementById('bonusProficiencia').value,
        ca:              document.getElementById('ca').value,
        iniciativa:      document.getElementById('iniciativa').value,
        deslocAndar:     document.getElementById('deslocAndar').value,
        deslocNadar:     document.getElementById('deslocNadar').value,
        deslocVoar:      document.getElementById('deslocVoar').value,
        deslocEscalar:   document.getElementById('deslocEscalar').value,
        salto:           document.getElementById('salto').value,
        pvTotais:        document.getElementById('pvTotais').value,
        pvAtuais:        document.getElementById('pvAtuais').value,
        pvTemp:          document.getElementById('pvTemp').value,
        pc: document.getElementById('pc').value, pe: document.getElementById('pe').value,
        pl: document.getElementById('pl').value, po: document.getElementById('po').value,
        pp: document.getElementById('pp').value,
        idiomas:         document.getElementById('idiomas').value,
        tesouro:         document.getElementById('tesouro').value,
        habilidadeMagia: document.getElementById('habilidadeMagia').value,
        extraBonusMagia: document.getElementById('extraBonusMagia').value,
        cdMagia:         document.getElementById('cdMagia').value,
        bonusMagia:      document.getElementById('bonusMagia').value,
        slot1Current: document.getElementById('slot1Current').value, slot1Max: document.getElementById('slot1Max').value,
        slot2Current: document.getElementById('slot2Current').value, slot2Max: document.getElementById('slot2Max').value,
        slot3Current: document.getElementById('slot3Current').value, slot3Max: document.getElementById('slot3Max').value,
        slot4Current: document.getElementById('slot4Current').value, slot4Max: document.getElementById('slot4Max').value,
        slot5Current: document.getElementById('slot5Current').value, slot5Max: document.getElementById('slot5Max').value,
        slot6Current: document.getElementById('slot6Current').value, slot6Max: document.getElementById('slot6Max').value,
        slot7Current: document.getElementById('slot7Current').value, slot7Max: document.getElementById('slot7Max').value,
        slot8Current: document.getElementById('slot8Current').value, slot8Max: document.getElementById('slot8Max').value,
        slot9Current: document.getElementById('slot9Current').value, slot9Max: document.getElementById('slot9Max').value,
        idade: document.getElementById('idade').value, altura: document.getElementById('altura').value,
        peso:  document.getElementById('peso').value,
        caracteristicas: document.getElementById('caracteristicas').value,
        personalidade:   document.getElementById('personalidade').value,
        ideais:          document.getElementById('ideais').value,
        vinculos:        document.getElementById('vinculos').value,
        defeitos:        document.getElementById('defeitos').value,
        historia:        document.getElementById('historia').value,
        anotacoes:       document.getElementById('anotacoes').value,
        skillProficiencies, attacks, abilities, inventoryItems,
        magicItems, spells, individualsUnit,
        characterImage: characterImageData,
    };
}

function loadCharacterData(char) {
    if (!char) return;
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    const chk = (id, val) => { const el = document.getElementById(id); if (el) el.checked = val || false; };

    set('nomePersonagem', char.nomePersonagem);  set('nomeJogador', char.nomeJogador);
    set('classeNivel', char.classeNivel);        set('raca', char.raca);
    set('antecedente', char.antecedente);        set('tendencia', char.tendencia);
    chk('inspiracao', char.inspiracao);          chk('pontoHeroico', char.pontoHeroico);
    set('forca', char.forca||10);                set('destreza', char.destreza||10);
    set('constituicao', char.constituicao||10);  set('inteligencia', char.inteligencia||10);
    set('sabedoria', char.sabedoria||10);        set('carisma', char.carisma||10);
    chk('profForca', char.profForca);            chk('profDestreza', char.profDestreza);
    chk('profConstituicao', char.profConstituicao); chk('profInteligencia', char.profInteligencia);
    chk('profSabedoria', char.profSabedoria);    chk('profCarisma', char.profCarisma);
    set('bonusProficiencia', char.bonusProficiencia||1);
    set('ca', char.ca||10);                      set('iniciativa', char.iniciativa||0);
    set('deslocAndar', char.deslocAndar||'30');  set('deslocNadar', char.deslocNadar||'15');
    set('deslocVoar', char.deslocVoar||'-');     set('deslocEscalar', char.deslocEscalar||'15');
    set('salto', char.salto||'0');
    set('pvTotais', char.pvTotais||0);           set('pvAtuais', char.pvAtuais||0);
    set('pvTemp', char.pvTemp||0);
    set('pc', char.pc||0); set('pe', char.pe||0); set('pl', char.pl||0);
    set('po', char.po||0); set('pp', char.pp||0);
    set('idiomas', char.idiomas);                set('tesouro', char.tesouro);
    set('habilidadeMagia', char.habilidadeMagia); set('extraBonusMagia', char.extraBonusMagia||0);
    set('cdMagia', char.cdMagia||'8');           set('bonusMagia', char.bonusMagia||'0');
    for (let n=1;n<=9;n++) {
        set(`slot${n}Current`, char[`slot${n}Current`]||'0');
        set(`slot${n}Max`,     char[`slot${n}Max`]    ||'0');
    }
    set('idade', char.idade);  set('altura', char.altura);  set('peso', char.peso);
    set('caracteristicas', char.caracteristicas); set('personalidade', char.personalidade);
    set('ideais', char.ideais);  set('vinculos', char.vinculos); set('defeitos', char.defeitos);
    set('historia', char.historia);  set('anotacoes', char.anotacoes);

    characterImageData = char.characterImage || null;
    skillProficiencies = char.skillProficiencies || {};
    attacks            = char.attacks        || [];
    abilities          = char.abilities      || [];
    inventoryItems     = char.inventoryItems || [];
    magicItems         = char.magicItems     || [];
    individualsUnit    = char.individualsUnit|| [];
    spells             = char.spells || { truques:[],nivel1:[],nivel2:[],nivel3:[],nivel4:[],nivel5:[],nivel6:[],nivel7:[],nivel8:[],nivel9:[] };

    SKILLS.forEach(skill => {
        const sel = document.getElementById(`skillProf_${skill.name}`);
        if (sel) sel.value = skillProficiencies[skill.name] || 'none';
    });

    renderInventory();
    renderMagicItems();
    renderSpells();
    renderAttacks();
    calculateModifiers();
    renderIndiduals();
    renderAbilities();
    displayCharacterImage(characterImageData);
}

// ================================================================
//  SAVE / LOAD NA NUVEM ✅
// ================================================================
async function saveCharacter() {
    const char = getCurrentCharacter();

    // 1. Backup local
    localStorage.setItem('characterData', JSON.stringify(char));

    // 2. Nuvem
    const nome = char.nomePersonagem || 'Sem nome';
    const { error } = await cloudSave('dnd', char, nome);

    if (error) {
        showSaveIndicator('Erro ao salvar na nuvem', true);
        console.error('cloudSave D&D:', error);
    } else {
        showSaveIndicator('Salvo na nuvem');
    }
}

// Debounce — 1.5s após última edição
function autoSave() {
    clearTimeout(_autoSaveTimer);
    _autoSaveTimer = setTimeout(saveCharacter, 1500);
}

async function loadCharacter() {
    // 1. Tenta nuvem
    const dadosNuvem = await cloudLoad('dnd');
    if (dadosNuvem) {
        loadCharacterData(dadosNuvem);
        showSaveIndicator('Ficha carregada da nuvem');
        return;
    }
    // 2. Fallback localStorage
    const local = localStorage.getItem('characterData');
    if (local) {
        try { loadCharacterData(JSON.parse(local)); } catch(e) { console.warn('Erro ao carregar local:', e); }
    }
}

async function newCharacter() {
    if (!confirm('Criar nova ficha? A atual ficara salva na nuvem.')) return;
    await cloudDelete('dnd');
    localStorage.removeItem('characterData');
    location.reload();
}

// ================================================================
//  EXPORT / IMPORT JSON
// ================================================================
function exportCharacterJSON() {
    const char = getCurrentCharacter();
    if (!char.nomePersonagem) { alert('Insira um nome antes de exportar.'); return; }
    const blob = new Blob([JSON.stringify(char,null,2)], {type:'application/json'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${char.nomePersonagem}.json`; a.click();
    URL.revokeObjectURL(url);
}

function importCharacterJSON(event) {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const char = JSON.parse(e.target.result);
            loadCharacterData(char);
            saveCharacter();
        } catch(err) { alert('Erro ao importar JSON.'); }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// ================================================================
//  MODAL DE CARREGAR (localStorage)
// ================================================================
function showLoadModal() {
    const modal = document.getElementById('loadModal');
    const list  = document.getElementById('characterList');
    const chars = JSON.parse(localStorage.getItem('dnd_characters') || '[]');
    list.innerHTML = '';
    if (!chars.length) {
        list.innerHTML = '<p>Nenhum personagem salvo localmente.</p>';
    } else {
        chars.forEach((char, i) => {
            const div = document.createElement('div');
            div.className = 'character-item';
            div.innerHTML = `
                <div onclick="loadCharacterByIndex(${i})">
                    <div class="character-name">${char.nomePersonagem}</div>
                    <div class="character-details">${char.classeNivel||''} - ${char.raca||''}</div>
                </div>
                <button class="delete-btn" onclick="deleteCharacter('${char.nomePersonagem}',event)">Excluir</button>`;
            list.appendChild(div);
        });
    }
    modal.classList.add('active');
}
function hideLoadModal()          { document.getElementById('loadModal').classList.remove('active'); }
function loadCharacterByIndex(i)  { const chars=JSON.parse(localStorage.getItem('dnd_characters')||'[]'); hideLoadModal(); if(chars[i])loadCharacterData(chars[i]); }
function deleteCharacter(name,e)  { e.stopPropagation(); if(!confirm(`Excluir ${name}?`))return; let c=JSON.parse(localStorage.getItem('dnd_characters')||'[]'); localStorage.setItem('dnd_characters',JSON.stringify(c.filter(x=>x.nomePersonagem!==name))); showLoadModal(); }

// ================================================================
//  INDICADOR DE SAVE
// ================================================================
function showSaveIndicator(msg = 'Salvo automaticamente', isError = false) {
    const el = document.getElementById('saveIndicator');
    if (!el) return;
    el.textContent = (isError ? '' : '') + msg;
    el.style.background = isError ? 'rgba(180,40,40,0.85)' : '';
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => {
        el.classList.remove('show');
        el.textContent = 'Salvo automaticamente';
        el.style.background = '';
    }, 2500);
}

// ================================================================
//  ABAS
// ================================================================
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(tabId)?.classList.add('active');
}

// ================================================================
//  DARK MODE
// ================================================================
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('dnd_dark_mode', document.body.classList.contains('dark-mode'));
}

// ================================================================
//  INICIALIZAÇÃO
// ================================================================
document.addEventListener('DOMContentLoaded', async () => {
    initSkills();
    setupImageUpload();

    // Carrega dark mode
    if (localStorage.getItem('dnd_dark_mode') === 'true') {
        document.body.classList.add('dark-mode');
        const cb = document.getElementById('toggleDarkMode');
        if (cb) cb.checked = true;
    }

    // Carrega ficha (nuvem primeiro, local como fallback)
    await loadCharacter();

    // Fecha modal ao clicar fora
    window.addEventListener('click', e => {
        const modal = document.getElementById('loadModal');
        if (modal && e.target === modal) hideLoadModal();
    });
});