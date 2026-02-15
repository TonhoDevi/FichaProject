// ========================================
// VARIÁVEIS GLOBAIS
// ========================================
let inventoryItems = [];
let magicItems = [];

// ========================================
// GERENCIAMENTO DE INVENTÁRIO
// ========================================
function renderInventory() {
    const inventoryList = document.getElementById('inventoryList');
    if (!inventoryList) return;
    
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