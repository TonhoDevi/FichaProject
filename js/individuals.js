// ========================================
// VARIÁVEIS GLOBAIS
// ========================================
let individualsUnit = [];

// ========================================
// GERENCIAMENTO DE INDIVÍDUOS
// ========================================
function renderIndiduals() {
    const individualsList = document.getElementById('individualsList');
    if (!individualsList) return;
    
    individualsList.innerHTML = '';
    
    individualsUnit.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'individuals-unit';
        div.innerHTML = `
            <div class="individuals-unit-header">
                <input 
                    type="text" 
                    placeholder="Nome do indivíduo" 
                    value="${item.nome}" 
                    oninput="updateIndividual(${index}, 'nome', this.value)"
                    onclick="event.stopPropagation()"
                >
                <button 
                    class="individuals-unit-expand ${item.expanded ? 'active' : ''}" 
                    onclick="toggleIndividualDescription(${index})"
                >
                    ▼
                </button>
            </div>
            <div class="individuals-unit-description ${item.expanded ? 'active' : ''}" id="individualsDesc${index}">
                <div class="individuals-unit-description-content">
                    <textarea 
                        placeholder="Descreva o indivíduo e sua relação com o personagem..."
                        oninput="updateIndividual(${index}, 'descricao', this.value)"
                    >${item.descricao || ''}</textarea>
                </div>
                <div class="individuals-unit-actions">
                    <button class="delete-btn" onclick="removeIndividual(${index})">✕ Excluir Indivíduo</button>
                </div>
            </div>
        `;
        individualsList.appendChild(div);
    });
}

function addIndividual() {
    individualsUnit.push({ 
        nome: '', 
        descricao: '', 
        expanded: false 
    });
    renderIndiduals();
    autoSave();
}

function updateIndividual(index, field, value) {
    individualsUnit[index][field] = value;
    autoSave();
}

function removeIndividual(index) {
    if (confirm('Deseja excluir este indivíduo?')) {
        individualsUnit.splice(index, 1);
        renderIndiduals();
        autoSave();
    }
}

function toggleIndividualDescription(index) {
    individualsUnit[index].expanded = !individualsUnit[index].expanded;
    renderIndiduals();
}