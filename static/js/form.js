// JavaScript para o formulário de cadastro de fabricantes

class FabricanteForm {
    constructor() {
        this.form = document.querySelector("form");
        this.nome = document.getElementById("nome");
        this.descricao = document.getElementById("descricao");
        this.imagem = document.getElementById("imagem");
        this.messageDiv = document.getElementById("message");
        this.submitBtn = document.querySelector("button[type='submit']");
        
        this.errorElements = [
            document.getElementById("nome-error"),
            document.getElementById("descricao-error"),
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
                value: this.descricao.value,
                element: this.errorElements[1],
                message: 'Descrição é obrigatória'
            }
        ];
        
        let isValid = true;
        
        // Validar campos de texto
        fields.forEach(field => {
            if (!field.value || !field.value.trim()) {
                if (field.element) {
                    field.element.textContent = field.message;
                    field.element.style.color = 'red';
                }
                isValid = false;
            }
        });
        
        // Validar arquivo de imagem
        if (!this.imagem.files[0]) {
            if (this.errorElements[2]) {
                this.errorElements[2].textContent = 'Imagem é obrigatória';
                this.errorElements[2].style.color = 'red';
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
        formData.append("descricao", this.descricao.value);
        formData.append("imagem", this.imagem.files[0]);
        
        // Definir estado de carregamento
        this.setLoading(true);
        this.messageDiv.innerHTML = "";
        
        try {
            const result = await makeRequest("/api/fabricantes", {
                method: "POST",
                body: formData,
            });
            
            this.setLoading(false);
            
            if (result.success && result.data.mensagem) {
                showMessage(this.messageDiv, result.data.mensagem, "success");
                this.form.reset();
                
                // Dispara evento para notificar que um fabricante foi adicionado
                const event = new CustomEvent('fabricante-added', {
                    detail: { message: result.data.mensagem }
                });
                document.dispatchEvent(event);
                
            } else if (result.data && result.data.erro) {
                showMessage(this.messageDiv, result.data.erro, "error");
            } else if (result.error) {
                showMessage(this.messageDiv, "Erro ao conectar com o servidor", "error");
            }
        } catch (error) {
            this.setLoading(false);
            console.error("Erro ao enviar formulário:", error);
            showMessage(this.messageDiv, "Erro inesperado", "error");
        }
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new FabricanteForm();
});