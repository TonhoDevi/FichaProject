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
let characterImageData = null;

// ========================================
// INICIALIZAÇÃO DAS PERÍCIAS
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
// CÁLCULOS DE MAGIA
// ========================================
function updateMagicAtribute(attributeName) {
    calculateMagicBonus();
    calculateMagicCd();
}

function calculateMagicCd() {
    const bonusProficiencia = parseInt(document.getElementById('bonusProficiencia').value) || 2;
    const habilidade = document.getElementById('habilidadeMagia').value;
    const bonusAtributo = habilidade ? parseInt(document.getElementById(habilidade).value) || 10 : 10;
    const extraBonus = parseInt(document.getElementById('extraBonusMagia').value) || 0;
    const cdBase = 8;
    const cdTotal = cdBase + bonusProficiencia + getModifier(bonusAtributo) + extraBonus;
    document.getElementById('cdMagia').value = cdTotal;
}

function calculateMagicBonus() {
    const bonusProficiencia = parseInt(document.getElementById('bonusProficiencia').value) || 2;
    const habilidade = document.getElementById('habilidadeMagia').value;
    const bonusAtributo = habilidade ? parseInt(document.getElementById(habilidade).value) || 10 : 10;
    const extraBonus = parseInt(document.getElementById('extraBonusMagia').value) || 0;
    const totalBonus = bonusProficiencia + getModifier(bonusAtributo) + extraBonus;
    document.getElementById('bonusMagia').value = totalBonus >= 0 ? `+${totalBonus}` : totalBonus;
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
// GERENCIAMENTO DE IMAGEM DO PERSONAGEM
// ========================================

document.getElementById('imageUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            characterImageData = event.target.result;
            displayCharacterImage(characterImageData);
            autoSave();
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('imagePreview').addEventListener('click', function() {
    document.getElementById('imageUpload').click();
});

function displayCharacterImage(imageData) {
    const img = document.getElementById('characterImage');
    const placeholder = document.getElementById('imagePlaceholder');
    const removeBtn = document.getElementById('removeImageBtn');
    
    if (imageData) {
        img.src = imageData;
        img.style.display = 'block';
        placeholder.style.display = 'none';
        removeBtn.style.display = 'inline-block';
    } else {
        img.style.display = 'none';
        placeholder.style.display = 'flex';
        removeBtn.style.display = 'none';
    }
}

function removeCharacterImage() {
    if (confirm('Deseja remover a imagem do personagem?')) {
        characterImageData = null;
        displayCharacterImage(null);
        document.getElementById('imageUpload').value = '';
        autoSave();
    }
}