// ========================================
// VARIÁVEIS GLOBAIS
// ========================================
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