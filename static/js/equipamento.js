// Função auxiliar pra limpar erros (se não existir, adicione)
function clearErrors(errorElements) {
    errorElements.forEach(el => {
        if (el) {
            el.textContent = '';
            el.style.color = '';
        }
    });
}

// Função auxiliar pra mostrar mensagens (se não existir, adicione ou use alert/toast)
function showMessage(element, message, type) {
    element.innerHTML = `<div class="${type}">${message}</div>`;  // Assuma CSS pra .success e .error
    // Ou use: element.textContent = message; element.className = type;
}

class EquipForm {
    constructor() {
        this.form = document.querySelector("form");
        this.nome = document.getElementById("nome");
        this.imagem = document.getElementById("imagem");
        this.documento = document.getElementById("documento");
        this.fabricanteSelect = document.getElementById("fabricante");  // <- ADICIONADO: select do fabricante
        this.messageDiv = document.getElementById("message");
        this.submitBtn = document.querySelector("button[type='submit']");
        
        this.errorElements = [
            document.getElementById("nome-error"),
            document.getElementById("fabricante-error"),  // <- ADICIONADO: pro select
            document.getElementById("documento-error"),
            document.getElementById("imagem-error")
        ];    
        this.init();
    }
    
    init() {
        if (this.form) {
            this.form.addEventListener("submit", (e) => this.handleSubmit(e));
        }
    }
    
    setLoading(isLoading) {
        if (this.submitBtn) {
            if (isLoading) {
                this.submitBtn.disabled = true;
                this.submitBtn.textContent = 'Processando...';
            } else {
                this.submitBtn.disabled = false;
                this.submitBtn.textContent = 'Cadastrar';
            }
        }
    }
    
    validateForm() {
        // Limpar erros anteriores
        clearErrors(this.errorElements);
        
        const fields = [
            {
                value: this.nome.value,
                element: this.errorElements[0],
                message: 'Nome é obrigatório'
            },
            {
                value: this.fabricanteSelect ? this.fabricanteSelect.value : '',
                element: this.errorElements[1],
                message: 'Selecione um fabricante'
            }
        ];
        
        let isValid = true;
        
        // Validar campos de texto e select
        fields.forEach(field => {
            if (!field.value || !field.value.trim()) {
                if (field.element) {
                    field.element.textContent = field.message;
                    field.element.style.color = 'red';
                }
                isValid = false;
            }
        });
        
        // Validar arquivo de documento
        if (!this.documento.files[0] || this.documento.files[0].name === '') {
            if (this.errorElements[2]) {
                this.errorElements[2].textContent = 'Documento é obrigatório';
                this.errorElements[2].style.color = 'red';
            }
            isValid = false;
        }
        
        // Validar arquivo de imagem
        if (!this.imagem.files[0] || this.imagem.files[0].name === '') {
            if (this.errorElements[3]) {
                this.errorElements[3].textContent = 'Imagem é obrigatória';
                this.errorElements[3].style.color = 'red';
            }
            isValid = false;
        }
        
        return isValid;
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }
        
        // Preparar dados do formulário
        const formData = new FormData();
        formData.append("nome", this.nome.value);
        formData.append("id_fabricantes", this.fabricanteSelect.value);  // <- ADICIONADO: envia o ID
        formData.append("documento", this.documento.files[0]);
        formData.append("imagem", this.imagem.files[0]);
        
        // Definir estado de carregamento
        this.setLoading(true);
        this.messageDiv.innerHTML = "";
        
        try {
            // Assuma que makeRequest é uma função como esta (se não for, use fetch direto)
            // const result = await makeRequest("/api/fabricantes", { method: "POST", body: formData });
            
            // Ou use fetch direto (recomendo, mais simples pra FormData)
            const response = await fetch("/api/equipamentos", {
                method: "POST",
                body: formData  // Não setar Content-Type, browser cuida
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            this.setLoading(false);
            
            if (result.mensagem) {  // Ajustado pro formato da rota (sem .data, baseado no seu código)
                showMessage(this.messageDiv, result.mensagem, "success");
                this.form.reset();
                this.fabricanteSelect.selectedIndex = 0;  // Reset pro primeiro option
                
                // Dispara evento (mudei pra 'equipamento-added' pra clareza, mas ok como tá)
                const event = new CustomEvent('equipamento-added', {  // Ou 'fabricante-added' se preferir
                    detail: { message: result.mensagem }
                });
                document.dispatchEvent(event);
                
            } else if (result.erro) {
                showMessage(this.messageDiv, result.erro, "error");
            } else {
                showMessage(this.messageDiv, "Resposta inesperada do servidor", "error");
            }
        } catch (error) {
            this.setLoading(false);
            console.error("Erro ao enviar formulário:", error);
            showMessage(this.messageDiv, "Erro ao conectar com o servidor", "error");
        }
    }
}

// Função pra carregar fabricantes (já boa, mas adicionei check se select existe)
async function carregarFabricantes() {
    const select = document.getElementById('fabricante');
    if (!select) {
        console.warn('Select #fabricante não encontrado');
        return;
    }
    
    try {
        const response = await fetch('/api/nome_fabricantes', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const fabricantes = await response.json();
        
        // Limpa opções existentes (exceto a padrão)
        select.querySelectorAll('option:not(:first-child)').forEach(opt => opt.remove());

        // Adiciona as opções dinamicamente
        fabricantes.forEach(fabricante => {
            const option = document.createElement('option');
            option.value = fabricante.id;
            option.textContent = fabricante.nome;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar fabricantes:', error);
        alert('Não foi possível carregar os fabricantes.');
    }
}

// Chama a função quando a página carrega
window.addEventListener('load', carregarFabricantes);  // Melhor que onload, pra evitar conflitos

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new EquipForm();  // <- CORRIGIDO: era FabricanteForm
});