// JavaScript para a listagem de fabricantes
// Utiliza o FabricanteLoader para carregar dados

class FabricanteList {
    constructor() {
        this.loading = document.getElementById('loading');
        this.errorDiv = document.getElementById('error');
        this.container = document.getElementById('fabricantes-container');
        this.noFabricantes = document.getElementById('no-fabricantes');
        this.loader = window.FabricanteLoader;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadFabricantes();
    }
    
    setupEventListeners() {
        // Escuta eventos do FabricanteLoader
        document.addEventListener('fabricantes-loaded', (event) => {
            const { fabricantes, fromCache } = event.detail;
            this.renderFabricantes(fabricantes);
            this.hideLoading();
            
            console.log(`Fabricantes renderizados (${fromCache ? 'cache' : 'API'}):`, fabricantes.length);
        });
        
        document.addEventListener('fabricantes-error', (event) => {
            const { error } = event.detail;
            this.showError('Erro ao carregar fabricantes: ' + error);
        });
    }
    
    showError(message) {
        if (this.errorDiv) {
            this.errorDiv.textContent = message;
            this.errorDiv.style.display = 'block';
        }
        this.hideLoading();
    }
    
    hideLoading() {
        if (this.loading) {
            this.loading.style.display = 'none';
        }
    }  
   createFabricanteCard(fabricante) {
    const card = document.createElement('div');
    card.className = 'fabricante-card';
    card.dataset.fabricanteId = fabricante.id;
    
    // Alterado de `/static/uploads/` para `/uploads/`
    const imagemSrc = fabricante.imagem ? `/uploads/${fabricante.imagem}` : this.loader.getPlaceholderImage();

    card.innerHTML = `
    <div class = "card">
        <img src="${imagemSrc}" 
             alt="${fabricante.nome}" 
             class="fabricante-imagem" 
             onerror="this.src='${this.loader.getPlaceholderImage()}'">
        <div class="fabricante-info">
            <div class="fabricante-nome">${this.escapeHtml(fabricante.nome)}</div>
            <div class="fabricante-descricao">${this.escapeHtml(fabricante.descricao)}</div>
            <div class="fabricante-data">Cadastrado em: ${fabricante.data_criacao}</div>
        </div>
    </div>
    `;
    
    return card;
}

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }
    
    async loadFabricantes(forceReload = false) {
        try {
        const response = await fetch('http://localhost:5000/api/fabricantes');
        const data = await response.json();
        const fabricantes = data.fabricantes.map(fabricante => {
            // Remove prefixo 'static/uploads/' se presente
            if (fabricante.imagem && fabricante.imagem.startsWith('static/uploads/')) {
                fabricante.imagem = fabricante.imagem.replace('static/uploads/', '');
            }
            return fabricante;
        });
        const event = new CustomEvent('fabricantes-loaded', { detail: { fabricantes, fromCache: false } });
        document.dispatchEvent(event);
    } catch (error) {
        document.dispatchEvent(new CustomEvent('fabricantes-error', { detail: { error } }));
    }
}
    
    renderFabricantes(fabricantes) {
        if (!this.container) return;
        
        // Limpar container
        this.container.innerHTML = '';
        
        // Criar cards para cada fabricante
        fabricantes.forEach(fabricante => {
            const card = this.createFabricanteCard(fabricante);
            this.container.appendChild(card);
        });
    }
    
    // Método para recarregar a lista
    reload() {
        if (this.loading) {
            this.loading.style.display = 'block';
        }
        if (this.errorDiv) {
            this.errorDiv.style.display = 'none';
        }
        if (this.noFabricantes) {
            this.noFabricantes.style.display = 'none';
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        this.loadFabricantes();
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.fabricanteList = new FabricanteList();
});