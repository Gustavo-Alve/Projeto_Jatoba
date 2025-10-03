// Utilitários comuns para a aplicação

// Função para mostrar mensagens
function showMessage(messageDiv, message, type) {
    messageDiv.innerHTML = `<div style="color: ${type === 'success' ? 'green' : 'red'}; margin-top: 10px;">${message}</div>`;
    setTimeout(() => {
        messageDiv.innerHTML = "";
    }, 5000);
}

// Função para fazer requisições HTTP
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return { success: response.ok, data, status: response.status };
    } catch (error) {
        console.error('Erro na requisição:', error);
        return { success: false, error: error.message };
    }
}

// Função para formatar data
function formatDate(dateString) {
    if (!dateString) return 'Data não informada';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
    } catch {
        return dateString;
    }
}

// Função para validar campos obrigatórios
function validateRequiredFields(fields) {
    const errors = [];
    
    fields.forEach(field => {
        if (!field.value || !field.value.trim()) {
            errors.push({
                element: field.element,
                message: field.message
            });
        }
    });
    
    return errors;
}

// Função para limpar mensagens de erro
function clearErrors(errorElements) {
    errorElements.forEach(element => {
        if (element) {
            element.textContent = "";
        }
    });
}