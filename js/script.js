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
        equipamento: document.getElementById('equipamento').value,
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
        espacos1: document.getElementById('espacos1').value,
        espacos2: document.getElementById('espacos2').value,
        espacos3: document.getElementById('espacos3').value,
        espacos4: document.getElementById('espacos4').value,
        espacos5: document.getElementById('espacos5').value,
        espacos6: document.getElementById('espacos6').value,
        espacos7: document.getElementById('espacos7').value,
        espacos8: document.getElementById('espacos8').value,
        espacos9: document.getElementById('espacos9').value,
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
    document.getElementById('equipamento').value = char.equipamento || '';
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
    document.getElementById('espacos1').value = char.espacos1 || '';
    document.getElementById('espacos2').value = char.espacos2 || '';
    document.getElementById('espacos3').value = char.espacos3 || '';
    document.getElementById('espacos4').value = char.espacos4 || '';
    document.getElementById('espacos5').value = char.espacos5 || '';
    document.getElementById('espacos6').value = char.espacos6 || '';
    document.getElementById('espacos7').value = char.espacos7 || '';
    document.getElementById('espacos8').value = char.espacos8 || '';
    document.getElementById('espacos9').value = char.espacos9 || '';
    
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
    if (characters[index]) {
        loadCharacterData(characters[index]);
        hideLoadModal();
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
// INICIALIZAR QUANDO A PÁGINA CARREGAR
// ========================================
initSkills();
calculateModifiers();
