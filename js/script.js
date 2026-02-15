// ========================================
// DADOS DAS PERÍCIAS
// ========================================
const SKILLS = [
    { name: 'Acrobacia', attr: 'destreza' },
    { name: 'Arcanismo', attr: 'inteligencia' },
    { name: 'Atletismo', attr: 'forca' },
    { name: 'Atuação', attr: 'carisma' },
    { name: 'Blefar', attr: 'carisma' },
    { name: 'Briga', attr: 'forca' },
    { name: 'Brutalidade', attr: 'forca' },
    { name: 'Furtividade', attr: 'destreza' },
    { name: 'História', attr: 'inteligencia' },
    { name: 'Intimidação', attr: 'carisma' },
    { name: 'Intuição', attr: 'sabedoria' },
    { name: 'Investigação', attr: 'inteligencia' },
    { name: 'Lidar com Animais', attr: 'sabedoria' },
    { name: 'Medicina', attr: 'sabedoria' },
    { name: 'Natureza', attr: 'inteligencia' },
    { name: 'Percepção', attr: 'sabedoria' },
    { name: 'Persuasão', attr: 'carisma' },
    { name: 'Prestidigitação', attr: 'destreza' },
    { name: 'Religião', attr: 'inteligencia' },
    { name: 'Resiliência', attr: 'constituicao' },
    { name: 'Sobrevivência', attr: 'sabedoria' },
    { name: 'Vigor', attr: 'constituicao' }
];
// ========================================
// VARIÁVEIS GLOBAIS
// ========================================
let skillProficiencies = {};
let attacks = [];
let autoSaveTimeout;
let inventoryItems = [];
let spells = {
    truques: [],
    nivel1: [],
    nivel2: [],
    nivel3: [],
    nivel4: [],
    nivel5: [],
    nivel6: [],
    nivel7: [],
    nivel8: [],
    nivel9: []
};

// ========================================
// INICIALIZAÇÃO
// ========================================
function initSkills() {
    const skillsList = document.getElementById('skillsList');
    skillsList.innerHTML = '';
    
    SKILLS.forEach(skill => {
        const div = document.createElement('div');
        div.className = 'skill-item';
        div.innerHTML = `
            <select class="skill-prof-select" id="skillProf_${skill.name}" onchange="updateSkillProf('${skill.name}', this.value)">
                <option value="none">-</option>
                <option value="proficient">Prof</option>
                <option value="expert">Esp</option>
            </select>
            <span class="skill-name">${skill.name}</span>
            <span class="skill-value" id="skillValue_${skill.name}">+0</span>
        `;
        skillsList.appendChild(div);
    });
}

// ========================================
// CÁLCULOS DE ATRIBUTOS
// ========================================
function getModifier(score) {
    return Math.floor((score - 10) / 2);
}

function calculateModifiers() {
    const attrs = ['forca', 'destreza', 'constituicao', 'inteligencia', 'sabedoria', 'carisma'];
    attrs.forEach(attr => {
        const value = parseInt(document.getElementById(attr).value) || 10;
        const mod = getModifier(value);
        const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
        document.getElementById(`${attr}Mod`).textContent = modStr;
    });
    calculateSavingThrows();
    calculateSkills();
    calculateMagicBonus();
    calculateMagicCd();
    updateMagicAtribute('carisma');
}

function calculateSavingThrows() {
    const attrs = ['forca', 'destreza', 'constituicao', 'inteligencia', 'sabedoria', 'carisma'];
    const profBonus = parseInt(document.getElementById('bonusProficiencia').value) || 1;
    
    attrs.forEach(attr => {
        const value = parseInt(document.getElementById(attr).value) || 10;
        const mod = getModifier(value);
        const checkboxId = `prof${attr.charAt(0).toUpperCase() + attr.slice(1)}`;
        const checkbox = document.getElementById(checkboxId);
        const isProficient = checkbox.checked;
        
        // Mudar cor da caixa do atributo
        const statBox = checkbox.closest('.stat-box');
        if (isProficient) {
            statBox.classList.add('proficient');
        } else {
            statBox.classList.remove('proficient');
        }
        
        const saveBonus = mod + (isProficient ? profBonus : 0);
        const saveStr = saveBonus >= 0 ? `+${saveBonus}` : `${saveBonus}`;
        document.getElementById(`${attr}Save`).textContent = `${saveStr}`;
    });
}

// ========================================
// CÁLCULOS DE PERÍCIAS
// ========================================
function calculateSkills() {
    const profBonus = parseInt(document.getElementById('bonusProficiencia').value) || 2;
    
    SKILLS.forEach(skill => {
        const attrValue = parseInt(document.getElementById(skill.attr).value) || 10;
        const attrMod = getModifier(attrValue);
        const profLevel = skillProficiencies[skill.name] || 'none';
        
        let bonus = attrMod;
        if (profLevel === 'proficient') {
            bonus += profBonus;
        } else if (profLevel === 'expert') {
            bonus += profBonus * 2;
        }
        
        const bonusStr = bonus >= 0 ? `+${bonus}` : `${bonus}`;
        document.getElementById(`skillValue_${skill.name}`).textContent = bonusStr;
    });
    
    // Calcular Percepção Passiva
    const sabedoriaValue = parseInt(document.getElementById('sabedoria').value) || 10;
    const sabedoriaMod = getModifier(sabedoriaValue);
    const percepcaoProf = skillProficiencies['Percepção'] || 'none';
    let percepcaoBonus = sabedoriaMod;
    if (percepcaoProf === 'proficient') percepcaoBonus += profBonus;
    if (percepcaoProf === 'expert') percepcaoBonus += profBonus * 2;
    document.getElementById('percepcaoPassiva').value = 10 + percepcaoBonus;
    
    // Calcular Intuição Passiva
    const intuicaoProf = skillProficiencies['Intuição'] || 'none';
    let intuicaoBonus = sabedoriaMod;
    if (intuicaoProf === 'proficient') intuicaoBonus += profBonus;
    if (intuicaoProf === 'expert') intuicaoBonus += profBonus * 2;
    document.getElementById('intuicaoPassiva').value = 10 + intuicaoBonus;
}

function updateSkillProf(skillName, level) {
    skillProficiencies[skillName] = level;
    calculateSkills();
    autoSave();
}
// ========================================
// CÁLCULOS DE Magia
// ========================================

function updateMagicAtribute(attributeName){
    habilidadeMagia = attributeName;
    calculateMagicBonus();
    calculateMagicCd();
}

function calculateMagicCd() {
    const bonusProficiencia = parseInt(document.getElementById('bonusProficiencia').value) || 2;
    const bonusAtributo = parseInt(document.getElementById(document.getElementById('habilidadeMagia').value).value) || 10;
    const extraBonus = parseInt(document.getElementById('extraBonusMagia').value) || 0;
    const cdBase = 8;
    const cdTotal = cdBase + bonusProficiencia + getModifier(bonusAtributo) + extraBonus;
    document.getElementById('cdMagia').value = cdTotal;
}
function calculateMagicBonus() {
    const bonusProficiencia = parseInt(document.getElementById('bonusProficiencia').value) || 2;
    const bonusAtributo = parseInt(document.getElementById(document.getElementById('habilidadeMagia').value).value) || 10;
    const extraBonus = parseInt(document.getElementById('extraBonusMagia').value) || 0;
    const totalBonus = bonusProficiencia + getModifier(bonusAtributo) + extraBonus;
    document.getElementById('bonusMagia').value = totalBonus;
}



// ========================================
// GERENCIAMENTO DE ATAQUES
// ========================================
function renderAttacks() {
    const attackList = document.getElementById('attackList');
    attackList.innerHTML = '';
    
    attacks.forEach((attack, index) => {
        const div = document.createElement('div');
        div.className = 'attack-item';
        div.innerHTML = `
            <input type="text" placeholder="Nome" value="${attack.nome}" oninput="updateAttack(${index}, 'nome', this.value)">
            <input type="text" placeholder="Bônus" value="${attack.bonus}" oninput="updateAttack(${index}, 'bonus', this.value)">
            <input type="text" placeholder="Dano" value="${attack.dano}" oninput="updateAttack(${index}, 'dano', this.value)">
            <button class="delete-btn" onclick="removeAttack(${index})">✕</button>
        `;
        attackList.appendChild(div);
    });
}

function addAttack() {
    attacks.push({ nome: '', bonus: '', dano: '' });
    renderAttacks();
    autoSave();
}

function updateAttack(index, field, value) {
    attacks[index][field] = value;
    autoSave();
}

function removeAttack(index) {
    attacks.splice(index, 1);
    renderAttacks();
    autoSave();
}

// ========================================
// SALVAR E CARREGAR PERSONAGENS
// ========================================
function cleanCurrentCharacter() {
    document.getElementById('nomePersonagem').value = '';
    document.getElementById('nomeJogador').value = '';
    document.getElementById('classeNivel').value = '';
    document.getElementById('raca').value = '';
    document.getElementById('antecedente').value = '';
    document.getElementById('tendencia').value = '';
    document.getElementById('inspiracao').checked = false;
    document.getElementById('pontoHeroico').checked = false;
    document.getElementById('forca').value = 10;
    document.getElementById('destreza').value = 10;
    document.getElementById('constituicao').value = 10;
    document.getElementById('inteligencia').value = 10;
    document.getElementById('sabedoria').value = 10;
    document.getElementById('carisma').value = 10;
    document.getElementById('profForca').checked = false;
    document.getElementById('profDestreza').checked = false;
    document.getElementById('profConstituicao').checked = false;
    document.getElementById('profInteligencia').checked = false;
    document.getElementById('profSabedoria').checked = false;
    document.getElementById('profCarisma').checked = false;
    document.getElementById('bonusProficiencia').value = 1;
    document.getElementById('ca').value = 10;
    document.getElementById('iniciativa').value = 0;
    document.getElementById('deslocAndar').value = '30';
    document.getElementById('deslocNadar').value = '15';
    document.getElementById('deslocVoar').value = '-';
    document.getElementById('deslocEscalar').value = '15';
    document.getElementById('dadosVida').value = '';
    document.getElementById('pvTotais').value = 0;
    document.getElementById('pvAtuais').value = 0;
    document.getElementById('pvTemp').value = 0;
    document.getElementById('equipamento').value = '';
    document.getElementById('pc').value = 0;
    document.getElementById('pe').value = 0;
    document.getElementById('pl').value = 0;
    document.getElementById('po').value = 0;
    document.getElementById('pp').value = 0;
    document.getElementById('idiomas').value = '';
    document.getElementById('caracteristicas').value = '';
    document.getElementById('tesouro').value = '';
    document.getElementById('habilidadeMagia').value = '';
    document.getElementById('extraBonusMagia').value = 0;
    document.getElementById('cdMagia').value = '8';
    document.getElementById('bonusMagia').value = '+0';
    document.getElementById('espacos1').value = '';
    document.getElementById('espacos2').value = '';
    document.getElementById('espacos3').value = '';
    document.getElementById('espacos4').value = '';
    document.getElementById('espacos5').value = '';
    document.getElementById('espacos6').value = '';
    document.getElementById('espacos7').value = '';
    document.getElementById('espacos8').value = '';
    document.getElementById('espacos9').value = '';
    skillProficiencies = {};
    attacks = [];
    renderAttacks();
    calculateModifiers();
}

function getCurrentCharacter() {
    return {
        nomePersonagem: document.getElementById('nomePersonagem').value,
        nomeJogador: document.getElementById('nomeJogador').value,
        classeNivel: document.getElementById('classeNivel').value,
        raca: document.getElementById('raca').value,
        antecedente: document.getElementById('antecedente').value,
        tendencia: document.getElementById('tendencia').value,
        inspiracao: document.getElementById('inspiracao').checked,
        pontoHeroico: document.getElementById('pontoHeroico').checked,
        forca: document.getElementById('forca').value,
        destreza: document.getElementById('destreza').value,
        constituicao: document.getElementById('constituicao').value,
        inteligencia: document.getElementById('inteligencia').value,
        sabedoria: document.getElementById('sabedoria').value,
        carisma: document.getElementById('carisma').value,
        profForca: document.getElementById('profForca').checked,
        profDestreza: document.getElementById('profDestreza').checked,
        profConstituicao: document.getElementById('profConstituicao').checked,
        profInteligencia: document.getElementById('profInteligencia').checked,
        profSabedoria: document.getElementById('profSabedoria').checked,
        profCarisma: document.getElementById('profCarisma').checked,
        bonusProficiencia: document.getElementById('bonusProficiencia').value,
        ca: document.getElementById('ca').value,
        iniciativa: document.getElementById('iniciativa').value,
        deslocAndar: document.getElementById('deslocAndar').value,
        deslocNadar: document.getElementById('deslocNadar').value,
        deslocVoar: document.getElementById('deslocVoar').value,
        deslocEscalar: document.getElementById('deslocEscalar').value,
        dadosVida: document.getElementById('dadosVida').value,
        pvTotais: document.getElementById('pvTotais').value,
        pvAtuais: document.getElementById('pvAtuais').value,
        pvTemp: document.getElementById('pvTemp').value,
        pc: document.getElementById('pc').value,
        pe: document.getElementById('pe').value,
        pl: document.getElementById('pl').value,
        po: document.getElementById('po').value,
        pp: document.getElementById('pp').value,
        idiomas: document.getElementById('idiomas').value,
        caracteristicas: document.getElementById('caracteristicas').value,
        tesouro: document.getElementById('tesouro').value,
        habilidadeMagia: document.getElementById('habilidadeMagia').value,
        extraBonusMagia: document.getElementById('extraBonusMagia').value,
        cdMagia: document.getElementById('cdMagia').value,
        bonusMagia: document.getElementById('bonusMagia').value,
        slot1Current: document.getElementById('slot1Current').value,
        slot1Max: document.getElementById('slot1Max').value,
        slot2Current: document.getElementById('slot2Current').value,
        slot2Max: document.getElementById('slot2Max').value,
        slot3Current: document.getElementById('slot3Current').value,
        slot3Max: document.getElementById('slot3Max').value,
        slot4Current: document.getElementById('slot4Current').value,
        slot4Max: document.getElementById('slot4Max').value,
        slot5Current: document.getElementById('slot5Current').value,
        slot5Max: document.getElementById('slot5Max').value,
        slot6Current: document.getElementById('slot6Current').value,
        slot6Max: document.getElementById('slot6Max').value,
        slot7Current: document.getElementById('slot7Current').value,
        slot7Max: document.getElementById('slot7Max').value,
        slot8Current: document.getElementById('slot8Current').value,
        slot8Max: document.getElementById('slot8Max').value,
        slot9Current: document.getElementById('slot9Current').value,
        slot9Max: document.getElementById('slot9Max').value,
        spells: spells,
        inventoryItems: inventoryItems,
        magicItems: magicItems, 
        skillProficiencies: skillProficiencies,
        attacks: attacks
    };
}

function loadCharacterData(char) {
    document.getElementById('nomePersonagem').value = char.nomePersonagem || '';
    document.getElementById('nomeJogador').value = char.nomeJogador || '';
    document.getElementById('classeNivel').value = char.classeNivel || '';
    document.getElementById('raca').value = char.raca || '';
    document.getElementById('antecedente').value = char.antecedente || '';
    document.getElementById('tendencia').value = char.tendencia || '';
    document.getElementById('inspiracao').checked = char.inspiracao || false;
    document.getElementById('pontoHeroico').checked = char.pontoHeroico || false;
    document.getElementById('forca').value = char.forca || 10;
    document.getElementById('destreza').value = char.destreza || 10;
    document.getElementById('constituicao').value = char.constituicao || 10;
    document.getElementById('inteligencia').value = char.inteligencia || 10;
    document.getElementById('sabedoria').value = char.sabedoria || 10;
    document.getElementById('carisma').value = char.carisma || 10;
    document.getElementById('profForca').checked = char.profForca || false;
    document.getElementById('profDestreza').checked = char.profDestreza || false;
    document.getElementById('profConstituicao').checked = char.profConstituicao || false;
    document.getElementById('profInteligencia').checked = char.profInteligencia || false;
    document.getElementById('profSabedoria').checked = char.profSabedoria || false;
    document.getElementById('profCarisma').checked = char.profCarisma || false;
    document.getElementById('bonusProficiencia').value = char.bonusProficiencia || 1;
    document.getElementById('ca').value = char.ca || 10;
    document.getElementById('iniciativa').value = char.iniciativa || 0;
    document.getElementById('deslocAndar').value = char.deslocAndar || '30';
    document.getElementById('deslocNadar').value = char.deslocNadar || '15';
    document.getElementById('deslocVoar').value = char.deslocVoar || '-';
    document.getElementById('deslocEscalar').value = char.deslocEscalar || '15';
    document.getElementById('dadosVida').value = char.dadosVida || '';
    document.getElementById('pvTotais').value = char.pvTotais || 0;
    document.getElementById('pvAtuais').value = char.pvAtuais || 0;
    document.getElementById('pvTemp').value = char.pvTemp || 0;
    document.getElementById('pc').value = char.pc || 0;
    document.getElementById('pe').value = char.pe || 0;
    document.getElementById('pl').value = char.pl || 0;
    document.getElementById('po').value = char.po || 0;
    document.getElementById('pp').value = char.pp || 0;
    document.getElementById('idiomas').value = char.idiomas || '';
    document.getElementById('caracteristicas').value = char.caracteristicas || '';
    document.getElementById('tesouro').value = char.tesouro || '';
    document.getElementById('habilidadeMagia').value = char.habilidadeMagia || '';
    document.getElementById('extraBonusMagia').value = char.extraBonusMagia || 0;
    document.getElementById('cdMagia').value = char.cdMagia || '8';
    document.getElementById('bonusMagia').value = char.bonusMagia || '+0';
    document.getElementById('slot1Current').value = char.slot1Current || '0';
    document.getElementById('slot1Max').value = char.slot1Max || '0';
    document.getElementById('slot2Current').value = char.slot2Current || '0';
    document.getElementById('slot2Max').value = char.slot2Max || '0';
    document.getElementById('slot3Current').value = char.slot3Current || '0';
    document.getElementById('slot3Max').value = char.slot3Max || '0';
    document.getElementById('slot4Current').value = char.slot4Current || '0';
    document.getElementById('slot4Max').value = char.slot4Max || '0';
    document.getElementById('slot5Current').value = char.slot5Current || '0';
    document.getElementById('slot5Max').value = char.slot5Max || '0';
    document.getElementById('slot6Current').value = char.slot6Current || '0';
    document.getElementById('slot6Max').value = char.slot6Max || '0';
    document.getElementById('slot7Current').value = char.slot7Current || '0';
    document.getElementById('slot7Max').value = char.slot7Max || '0';
    document.getElementById('slot8Current').value = char.slot8Current || '0';
    document.getElementById('slot8Max').value = char.slot8Max || '0';
    document.getElementById('slot9Current').value = char.slot9Current || '0';
    document.getElementById('slot9Max').value = char.slot9Max || '0';
    spells = char.spells || {
        truques: [], nivel1: [], nivel2: [], nivel3: [], nivel4: [],
        nivel5: [], nivel6: [], nivel7: [], nivel8: [], nivel9: []
    };
    inventoryItems = char.inventoryItems || [];
    magicItems = char.magicItems || []; 
    renderInventory();
    renderMagicItems();
    renderSpells();
    skillProficiencies = char.skillProficiencies || {};
    attacks = char.attacks || [];
    
    // Atualizar seletores de proficiência de perícias
    SKILLS.forEach(skill => {
        const profLevel = skillProficiencies[skill.name] || 'none';
        const select = document.getElementById(`skillProf_${skill.name}`);
        if (select) select.value = profLevel;
    });
    
    renderAttacks();
    calculateModifiers();
}

function saveCharacter() {
    const char = getCurrentCharacter();
    if (!char.nomePersonagem) {
        alert('Por favor, insira um nome para o personagem antes de salvar.');
        return;
    }
    
    const characters = JSON.parse(localStorage.getItem('dnd_characters') || '[]');
    const existingIndex = characters.findIndex(c => c.nomePersonagem === char.nomePersonagem);
    
    if (existingIndex >= 0) {
        characters[existingIndex] = char;
    } else {
        characters.push(char);
    }
    
    localStorage.setItem('dnd_characters', JSON.stringify(characters));
    showSaveIndicator();
}

function autoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        const char = getCurrentCharacter();
        if (char.nomePersonagem) {
            saveCharacter();
        }
    }, 2000);
}

function showSaveIndicator() {
    const indicator = document.getElementById('saveIndicator');
    indicator.classList.add('show');
    setTimeout(() => {loadModal
        indicator.classList.remove('show');
    }, 2000);
}

// ========================================
// MODAL DE CARREGAMENTO
// ========================================
function showLoadModal() {
    const modal = document.getElementById('loadModal');
    const list = document.getElementById('characterList');
    const characters = JSON.parse(localStorage.getItem('dnd_characters') || '[]');
    
    list.innerHTML = '';
    
    if (characters.length === 0) {
        list.innerHTML = '<p>Nenhum personagem salvo ainda.</p>';
    } else {
        characters.forEach((char, index) => {
            const div = document.createElement('div');
            div.className = 'character-item';
            div.innerHTML = `
                <div onclick="loadCharacterByIndex(${index})">
                    <div class="character-name">${char.nomePersonagem}</div>
                    <div class="character-details">${char.classeNivel || ''} - ${char.raca || ''}</div>
                </div>
                <button class="delete-btn" onclick="deleteCharacter('${char.nomePersonagem}', event)">Excluir</button>
            `;
            list.appendChild(div);
        });
    }
    
    modal.classList.add('active');
}

function hideLoadModal() {
    document.getElementById('loadModal').classList.remove('active');
}

function loadCharacterByIndex(index) {
    const characters = JSON.parse(localStorage.getItem('dnd_characters') || '[]');
    hideLoadModal();
    if (characters[index]) {
        loadCharacterData(characters[index]);
    }
    
}

function deleteCharacter(name, event) {
    event.stopPropagation();
    if (confirm(`Deseja excluir ${name}?`)) {
        const characters = JSON.parse(localStorage.getItem('dnd_characters') || '[]');
        const filtered = characters.filter(c => c.nomePersonagem !== name);
        localStorage.setItem('dnd_characters', JSON.stringify(filtered));
        showLoadModal();
    }
}

function newCharacter() {
    if (confirm('Criar nova ficha? Os dados não salvos serão perdidos.')) {
        cleanCurrentCharacter();
        hideLoadModal();
    }
}

// ========================================
// MENU LATERAL
// ========================================
function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    const toggle = document.getElementById('menuToggle');
    
    menu.classList.toggle('active');
    overlay.classList.toggle('active');
    
    // Mudar ícone do botão
    if (menu.classList.contains('active')) {
        toggle.textContent = '✕ Fechar';
    } else {
        toggle.textContent = '☰ Menu';
    }
}

// Fechar menu com tecla ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const menu = document.getElementById('sideMenu');
        if (menu.classList.contains('active')) {
            toggleMenu();
        }
    }
});

// ========================================
// GERENCIAMENTO DE INVENTÁRIO
// ========================================


function renderInventory() {
    const inventoryList = document.getElementById('inventoryList');
    inventoryList.innerHTML = '';
    
    inventoryItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'inventory-item';
        div.innerHTML = `
            <input type="number" placeholder="Qtd" value="${item.quantidade}" oninput="updateInventoryItem(${index}, 'quantidade', this.value)" min="0">
            <input type="text" placeholder="Nome do item" value="${item.nome}" oninput="updateInventoryItem(${index}, 'nome', this.value)">
            <button class="delete-btn" onclick="removeInventoryItem(${index})">✕</button>
        `;
        inventoryList.appendChild(div);
    });
}

function addInventoryItem() {
    inventoryItems.push({ quantidade: 1, nome: '' });
    renderInventory();
    autoSave();
}

function updateInventoryItem(index, field, value) {
    inventoryItems[index][field] = value;
    autoSave();
}

function removeInventoryItem(index) {
    inventoryItems.splice(index, 1);
    renderInventory();
    autoSave();
}

// ========================================
// GERENCIAMENTO DE ITENS MÁGICOS
// ========================================
let magicItems = [];

function renderMagicItems() {
    const magicItemsList = document.getElementById('magicItemsList');
    if (!magicItemsList) return;
    
    magicItemsList.innerHTML = '';
    
    magicItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'magic-item';
        div.innerHTML = `
            <div class="magic-item-header">
                <input 
                    type="text" 
                    placeholder="Nome do item mágico" 
                    value="${item.nome}" 
                    oninput="updateMagicItem(${index}, 'nome', this.value)"
                    onclick="event.stopPropagation()"
                >
                <div class="magic-item-sync" onclick="event.stopPropagation()">
                    <input 
                        type="checkbox" 
                        id="magicSync${index}"
                        ${item.sincronizado ? 'checked' : ''}
                        onchange="updateMagicItem(${index}, 'sincronizado', this.checked)"
                    >
                </div>
                <button 
                    class="magic-item-expand ${item.expanded ? 'active' : ''}" 
                    onclick="toggleMagicItemDescription(${index})"
                >
                    ▼
                </button>
            </div>
            <div class="magic-item-description ${item.expanded ? 'active' : ''}" id="magicDesc${index}">
                <div class="magic-item-description-content">
                    <textarea 
                        placeholder="Descreva o item mágico, suas propriedades, cargas, etc..."
                        oninput="updateMagicItem(${index}, 'descricao', this.value)"
                    >${item.descricao || ''}</textarea>
                </div>
                <div class="magic-item-actions">
                    <button class="delete-btn" onclick="removeMagicItem(${index})">🗑️ Excluir Item</button>
                </div>
            </div>
        `;
        magicItemsList.appendChild(div);
    });
}

function addMagicItem() {
    magicItems.push({ 
        nome: '', 
        descricao: '', 
        sincronizado: false,
        expanded: false 
    });
    renderMagicItems();
    autoSave();
}

function updateMagicItem(index, field, value) {
    magicItems[index][field] = value;
    autoSave();
}

function toggleMagicItemDescription(index) {
    magicItems[index].expanded = !magicItems[index].expanded;
    renderMagicItems();
}

function removeMagicItem(index) {
    if (confirm('Deseja excluir este item mágico?')) {
        magicItems.splice(index, 1);
        renderMagicItems();
        autoSave();
    }
}

// ========================================
// SISTEMA DE MAGIAS COMPLETO
// ========================================

function toggleSpellLevel(level) {
    const content = document.getElementById(`spells${level.charAt(0).toUpperCase() + level.slice(1)}`);
    const button = document.getElementById(`expand${level.charAt(0).toUpperCase() + level.slice(1)}`);
    
    content.classList.toggle('active');
    button.classList.toggle('active');
}

function renderSpells() {
    Object.keys(spells).forEach(level => {
        const listId = `spellList${level.charAt(0).toUpperCase() + level.slice(1)}`;
        const list = document.getElementById(listId);
        if (!list) return;
        
        list.innerHTML = '';
        
        spells[level].forEach((spell, index) => {
            const div = document.createElement('div');
            div.className = 'spell-card';
            div.innerHTML = `
                <div class="spell-card-header">
                    <input 
                        type="text" 
                        placeholder="Nome da magia" 
                        value="${spell.nome}" 
                        oninput="updateSpell('${level}', ${index}, 'nome', this.value)"
                        onclick="event.stopPropagation()"
                    >
                    <button 
                        class="spell-card-expand ${spell.expanded ? 'active' : ''}" 
                        onclick="toggleSpellDetails('${level}', ${index})"
                    >
                        ▼
                    </button>
                </div>
                <div class="spell-card-details ${spell.expanded ? 'active' : ''}" id="spellDetails${level}${index}">
                    <div class="spell-details-content">
                        <div class="spell-details-row">
                            <div class="input-group">
                                <label class="input-label">Tempo de Conjuração</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: 1 ação"
                                    value="${spell.tempo || ''}"
                                    oninput="updateSpell('${level}', ${index}, 'tempo', this.value)"
                                >
                            </div>
                            <div class="input-group">
                                <label class="input-label">Duração</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: 1 minuto"
                                    value="${spell.duracao || ''}"
                                    oninput="updateSpell('${level}', ${index}, 'duracao', this.value)"
                                >
                            </div>
                        </div>
                        
                        <div class="concentration-check">
                            <input 
                                type="checkbox" 
                                id="conc${level}${index}"
                                ${spell.concentracao ? 'checked' : ''}
                                onchange="updateSpell('${level}', ${index}, 'concentracao', this.checked)"
                            >
                            <label for="conc${level}${index}">⚠️ Requer Concentração</label>
                        </div>
                        
                        <div class="input-group">
                            <label class="input-label">Componentes</label>
                            <div class="spell-components">
                                <div class="component-check">
                                    <input 
                                        type="checkbox" 
                                        id="compV${level}${index}"
                                        ${spell.componenteV ? 'checked' : ''}
                                        onchange="updateSpell('${level}', ${index}, 'componenteV', this.checked)"
                                    >
                                    <label for="compV${level}${index}">V (Verbal)</label>
                                </div>
                                <div class="component-check">
                                    <input 
                                        type="checkbox" 
                                        id="compS${level}${index}"
                                        ${spell.componenteS ? 'checked' : ''}
                                        onchange="updateSpell('${level}', ${index}, 'componenteS', this.checked)"
                                    >
                                    <label for="compS${level}${index}">S (Somático)</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="input-group">
                            <label class="input-label">Descrição</label>
                            <textarea 
                                class="spell-description"
                                placeholder="Descreva os efeitos da magia..."
                                oninput="updateSpell('${level}', ${index}, 'descricao', this.value)"
                            >${spell.descricao || ''}</textarea>
                        </div>
                    </div>
                    <div class="spell-card-actions">
                        <button class="delete-btn" onclick="removeSpell('${level}', ${index})">🗑️ Excluir</button>
                    </div>
                </div>
            `;
            list.appendChild(div);
        });
    });
}

function addSpell(level) {
    spells[level].push({
        nome: '',
        tempo: '',
        duracao: '',
        concentracao: false,
        componenteV: false,
        componenteS: false,
        descricao: '',
        expanded: false
    });
    renderSpells();
    autoSave();
}

function updateSpell(level, index, field, value) {
    spells[level][index][field] = value;
    autoSave();
}

function toggleSpellDetails(level, index) {
    spells[level][index].expanded = !spells[level][index].expanded;
    renderSpells();
}

function removeSpell(level, index) {
    if (confirm('Deseja excluir esta magia?')) {
        spells[level].splice(index, 1);
        renderSpells();
        autoSave();
    }
}

// ========================================
// SISTEMA DE ABAS
// ========================================
function switchTab(tabId) {
    // Remover classe active de todos os botões e conteúdos
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Adicionar classe active no botão e conteúdo clicado
    event.target.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// ========================================
// INICIALIZAR QUANDO A PÁGINA CARREGAR
// ========================================
initSkills();
calculateModifiers();
renderInventory();
renderMagicItems();
renderSpells();