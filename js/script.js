// ========================================
// VARIÁVEIS GLOBAIS
// ========================================
let autoSaveTimeout;

// ========================================
// SALVAMENTO E CARREGAMENTO
// ========================================
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
    document.getElementById('bonusMagia').value = char.bonusMagia || '0';
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
    skillProficiencies = char.skillProficiencies || {};
    attacks = char.attacks || [];
    
    SKILLS.forEach(skill => {
        const profLevel = skillProficiencies[skill.name] || 'none';
        const select = document.getElementById(`skillProf_${skill.name}`);
        if (select) select.value = profLevel;
    });
    
    renderInventory();
    renderMagicItems();
    renderSpells();
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
    setTimeout(() => {
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
        location.reload();
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
    
    if (menu.classList.contains('active')) {
        toggle.textContent = '✕ Fechar';
    } else {
        toggle.textContent = '☰ Menu';
    }
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const menu = document.getElementById('sideMenu');
        if (menu.classList.contains('active')) {
            toggleMenu();
        }
    }
});

// ========================================
// SISTEMA DE ABAS
// ========================================
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    event.target.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// ========================================
// INICIALIZAÇÃO
// ========================================
initSkills();
calculateModifiers();
renderInventory();
renderMagicItems();
renderSpells();
renderAttacks();