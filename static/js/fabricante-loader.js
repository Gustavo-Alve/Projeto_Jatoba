/**
 * FabricanteLoader - Sistema exclusivo para carregamento de dados de fabricantes
 */

class FabricanteLoader {
    /**
     * Construtor da classe FabricanteLoader
     * Inicializa todas as propriedades necessárias para o funcionamento do loader
     */
    constructor() {
        // Map para armazenar dados em cache (key-value pairs)
        // Usado para evitar requisições desnecessárias à API
        this.cache = new Map();
        
        // Promise da requisição em andamento para evitar múltiplas chamadas simultâneas
        // Quando uma requisição está em andamento, outras aguardam o mesmo resultado
        this.loadingPromise = null;
        
        // Número máximo de tentativas em caso de falha na requisição
        this.retryAttempts = 3;
        
        // Delay entre tentativas de retry em milissegundos
        this.retryDelay = 1000; // 1 segundo
        
        // Chama método de inicialização
        this.init();
    }
    
    /**
     * Método de inicialização da classe
     * Configura logs e eventos necessários para o funcionamento
     */
    init() {
        console.log('FabricanteLoader inicializado');
        this.setupEventListeners();
    }
    
    /**
     * Configura os event listeners para eventos customizados do sistema
     * Estabelece comunicação reativa com outros componentes da aplicação
     */
    setupEventListeners() {
        // Escuta evento disparado quando um novo fabricante é adicionado via formulário
        // Automaticamente invalida o cache e recarrega os dados para manter sincronismo
        document.addEventListener('fabricante-added', () => {
            console.log('Evento fabricante-added recebido - invalidando cache e recarregando');
            this.invalidateCache();
            this.loadFabricantes(true); // Force reload para buscar dados atualizados da API
        });
        
        // Escuta evento disparado quando um fabricante é atualizado
        // Invalida cache para garantir que próximas consultas busquem dados atualizados
        document.addEventListener('fabricante-updated', () => {
            console.log('Evento fabricante-updated recebido - invalidando cache');
            this.invalidateCache();
        });
    }
    
    /**
     * Método principal para carregar todos os fabricantes da API
     * Implementa sistema de cache inteligente e controle de requisições simultâneas
     * 
     * @param {boolean} forceReload - Se true, ignora cache e força nova requisição à API
     * @returns {Promise<Array>} Promise que resolve com array de fabricantes processados
     */
    async loadFabricantes(forceReload = false) {
        // Chave única para identificar dados de todos os fabricantes no cache
        const cacheKey = 'all-fabricantes';
        
        // ESTRATÉGIA DE CACHE: Verifica se dados existem em cache e não é reload forçado
        // Isso evita requisições desnecessárias e melhora performance drasticamente
        if (!forceReload && this.cache.has(cacheKey)) {
            console.log('Dados carregados do cache - evitando requisição à API');
            const cachedData = this.cache.get(cacheKey);
            
            // Dispara evento informando que dados vieram do cache
            this.dispatchEvent('fabricantes-loaded', { 
                fabricantes: cachedData,
                fromCache: true 
            });
            
            return cachedData;
        }
        
        // CONTROLE DE REQUISIÇÕES SIMULTÂNEAS: Evita múltiplas chamadas à API ao mesmo tempo
        // Se já existe uma requisição em andamento, aguarda o resultado dela
        if (this.loadingPromise && !forceReload) {
            console.log('Aguardando requisição em andamento - evitando requisição duplicada');
            return await this.loadingPromise;
        }
        
        console.log('Iniciando carregamento de fabricantes da API');
        
        // Inicia requisição com retry automático e armazena a Promise
        this.loadingPromise = this.fetchWithRetry('/api/fabricantes');
        
        try {
            // Aguarda resultado da requisição HTTP
            const result = await this.loadingPromise;
            
            // VALIDAÇÃO DE RESPOSTA: Verifica se a requisição foi bem-sucedida
            if (!result.success) {
                throw new Error(result.error || 'Erro desconhecido na API');
            }
            
            const data = result.data;
            
            // VALIDAÇÃO DE DADOS: Verifica se a API retornou erro específico
            if (data.erro) {
                throw new Error(data.erro);
            }
            
            // Extrai array de fabricantes ou usa array vazio como fallback
            const fabricantes = data.fabricantes || [];
            
            // PROCESSAMENTO DE DADOS: Valida e limpa dados recebidos da API
            const processedFabricantes = this.processFabricantes(fabricantes);
            
            // ARMAZENAMENTO EM CACHE: Salva dados processados para uso futuro
            this.cache.set(cacheKey, processedFabricantes);
            
            console.log(`${processedFabricantes.length} fabricantes carregados com sucesso`);
            
            // COMUNICAÇÃO COM OUTROS COMPONENTES: Dispara evento para notificar carregamento
            this.dispatchEvent('fabricantes-loaded', { 
                fabricantes: processedFabricantes,
                fromCache: false // Indica que dados vieram da API, não do cache
            });
            
            return processedFabricantes;
            
        } catch (error) {
            console.error('Erro ao carregar fabricantes:', error);
            
            // TRATAMENTO DE ERRO: Notifica outros componentes sobre falha no carregamento
            this.dispatchEvent('fabricantes-error', { 
                error: error.message 
            });
            
            // Re-propaga erro para permitir tratamento específico pelo chamador
            throw error;
        } finally {
            // LIMPEZA: Sempre limpa Promise de carregamento ao final
            this.loadingPromise = null;
        }
    }
    
    /**
     * Carrega um fabricante específico pelo seu ID
     * Utiliza estratégia otimizada: primeiro verifica cache individual, depois busca na lista completa
     * 
     * @param {number} id - ID numérico do fabricante a ser buscado
     * @returns {Promise<Object|null>} Promise que resolve com objeto do fabricante ou null se não encontrado
     */
    async loadFabricanteById(id) {
        console.log(`Buscando fabricante ID: ${id}`);
        
        // Chave específica para cache individual de um fabricante
        const cacheKey = `fabricante-${id}`;
        
        // CACHE INDIVIDUAL: Primeiro verifica se este fabricante específico já está em cache
        // Isso é mais rápido que buscar na lista completa
        if (this.cache.has(cacheKey)) {
            console.log(`Fabricante ID ${id} carregado do cache individual`);
            return this.cache.get(cacheKey);
        }
        
        // BUSCA NA LISTA COMPLETA: Se não está em cache individual, busca na lista completa
        // Esta estratégia é eficiente pois popula o cache com todos os fabricantes
        try {
            // Carrega todos os fabricantes (pode vir do cache se já foi carregado antes)
            const allFabricantes = await this.loadFabricantes();
            
            // Busca o fabricante específico na lista usando find()
            // parseInt() garante comparação correta entre tipos number e string
            const fabricante = allFabricantes.find(f => f.id === parseInt(id));
            
            if (fabricante) {
                // OTIMIZAÇÃO: Armazena o fabricante individual no cache para buscas futuras
                // Isso evita ter que filtrar a lista completa novamente
                this.cache.set(cacheKey, fabricante);
                console.log(`Fabricante "${fabricante.nome}" encontrado e armazenado em cache individual`);
                return fabricante;
            } else {
                // LOG DE DEBUGGING: Importante para identificar IDs inexistentes
                console.warn(`Fabricante ID ${id} não encontrado na base de dados`);
                return null;
            }
            
        } catch (error) {
            // PROPAGAÇÃO DE ERRO: Mantém contexto específico do ID buscado
            console.error(`Erro ao buscar fabricante ID ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Processa e valida dados brutos dos fabricantes recebidos da API
     * Aplica sanitização, validação e formatação padronizada aos dados
     * 
     * @param {Array} fabricantes - Array bruto de fabricantes recebido da API
     * @returns {Array} Array de fabricantes processados e validados
     */
    processFabricantes(fabricantes) {
        // VALIDAÇÃO DE ENTRADA: Garante que recebemos um array válido
        if (!Array.isArray(fabricantes)) {
            console.warn('Dados de fabricantes não é um array:', fabricantes);
            return []; // Retorna array vazio como fallback seguro
        }
        
        // PROCESSAMENTO INDIVIDUAL: Aplica transformações e validações a cada fabricante
        return fabricantes.map(fabricante => {
            // SANITIZAÇÃO E PADRONIZAÇÃO: Limpa e converte dados para formatos consistentes
            const processed = {
                // ID: Converte para número inteiro, fallback para 0
                id: parseInt(fabricante.id) || 0,
                
                // NOME: Converte para string e remove espaços em branco nas extremidades
                nome: String(fabricante.nome || '').trim(),
                
                // DESCRIÇÃO: Converte para string e remove espaços em branco
                descricao: String(fabricante.descricao || '').trim(),
                
                // IMAGEM: Processa caminho da imagem para URL válida ou placeholder
                imagem: this.processImagePath(fabricante.imagem),
                
                // DATA ORIGINAL: Preserva data original do banco de dados
                data_criacao: fabricante.data_criacao || null,
                
                // DATA FORMATADA: Formata data para exibição em português brasileiro
                data_criacao_formatada: this.formatDate(fabricante.data_criacao)
            };
            
            // VALIDAÇÃO PÓS-PROCESSAMENTO: Identifica dados inconsistentes
            if (!processed.nome) {
                console.warn(`Fabricante ID ${processed.id} sem nome válido - pode causar problemas na interface`);
            }
            
            return processed;
        }).filter(fabricante => {
            // FILTRAGEM FINAL: Remove registros inválidos que poderiam quebrar a interface
            // Mantém apenas fabricantes com ID válido (> 0) e nome preenchido
            const isValid = fabricante.id > 0 && fabricante.nome;
            
            if (!isValid) {
                console.warn('Fabricante removido por dados inválidos:', fabricante);
            }
            
            return isValid;
        });
    }
    
    /**
     * Processa e normaliza caminhos de imagem do banco de dados para URLs válidas
     * Lida com diferentes formatos de caminho que podem vir do banco de dados
     * 
     * @param {string} imagemPath - Caminho da imagem conforme salvo no banco de dados
     * @returns {string} URL válida e completa para uso no frontend
     */
    processImagePath(imagemPath) {
        // CASO 1: Imagem inexistente ou vazia - retorna placeholder
        if (!imagemPath) {
            console.log('Imagem não fornecida - usando placeholder');
            return this.getPlaceholderImage();
        }
        
        // CASO 2: Caminho já está correto com barra inicial
        // Exemplo: "/static/uploads/imagem.jpg"
        if (imagemPath.startsWith('/static/')) {
            console.log('Caminho de imagem já está correto:', imagemPath);
            return imagemPath;
        }
        
        // CASO 3: Caminho sem barra inicial mas com "static"
        // Exemplo: "static/uploads/imagem.jpg" -> "/static/uploads/imagem.jpg"
        if (imagemPath.startsWith('static/')) {
            const correctedPath = '/' + imagemPath;
            console.log('Adicionada barra inicial ao caminho:', correctedPath);
            return correctedPath;
        }
        
        // CASO 4: Caminho completo com diretório
        // Exemplo: "c:\Users\...\static\uploads\imagem.jpg"
        if (imagemPath.includes('\\static\\uploads\\')) {
            // Extrair apenas a parte relevante do caminho
            const parts = imagemPath.split('\\static\\uploads\\');
            const fileName = parts[parts.length - 1];
            const correctedPath = '/static/uploads/' + fileName;
            console.log('Extraído nome do arquivo de caminho completo:', correctedPath);
            return correctedPath;
        }
        
        // CASO 5: Apenas nome do arquivo
        // Exemplo: "imagem.jpg" -> "/static/uploads/imagem.jpg"
        const fullPath = '/static/uploads/' + imagemPath;
        console.log('Construído caminho completo para arquivo:', fullPath);
        return fullPath;
    }
    
    /**
     * Gera URL de imagem placeholder em formato SVG codificado em base64
     * Usado quando fabricante não possui imagem ou quando imagem não pode ser carregada
     * 
     * @returns {string} Data URL completa do SVG placeholder
     */
    getPlaceholderImage() {
        // SVG placeholder responsivo com texto em português
        // Dimensões: 300x150px, fundo cinza claro, texto centralizado
        // Codificado em base64 para evitar requisições HTTP adicionais
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjE1MCIgeT0iNzUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+SW1hZ2VtIG7Do28gZW5jb250cmFkYTwvdGV4dD48L3N2Zz4=';
    }
    
    /**
     * Formata strings de data para exibição amigável em português brasileiro
     * Converte datas ISO ou timestamp em formato legível para usuários brasileiros
     * 
     * @param {string} dateString - String de data no formato ISO ou timestamp
     * @returns {string} Data formatada em português brasileiro ou mensagem de fallback
     */
    formatDate(dateString) {
        // VALIDAÇÃO DE ENTRADA: Verifica se data foi fornecida
        if (!dateString) {
            return 'Data não informada';
        }
        
        try {
            // CONVERSÃO: Tenta criar objeto Date a partir da string
            const date = new Date(dateString);
            
            // VALIDAÇÃO DE DATA VÁLIDA: Date inválido retorna NaN para getTime()
            if (isNaN(date.getTime())) {
                console.warn('Data inválida recebida:', dateString);
                return 'Data inválida';
            }
            
            // FORMATAÇÃO LOCALIZADA: Usa Intl.DateTimeFormat para formato brasileiro
            // Retorna formato: "DD/MM/AAAA HH:MM"
            const formattedDate = date.toLocaleDateString('pt-BR') + ' ' + 
                                date.toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',    // Força 2 dígitos para hora
                                    minute: '2-digit'   // Força 2 dígitos para minuto
                                });
            
            console.log(`Data formatada: ${dateString} -> ${formattedDate}`);
            return formattedDate;
            
        } catch (error) {
            // FALLBACK SEGURO: Se formatação falhar, retorna string original
            console.warn('Erro ao formatar data:', dateString, error);
            return dateString;
        }
    }
    
    /**
     * Executa requisições HTTP com sistema de retry automático inteligente
     * Implementa backoff strategy para lidar com falhas temporárias de rede
     * 
     * @param {string} url - URL completa para a requisição HTTP
     * @param {Object} options - Opções da requisição (method, headers, body, etc.)
     * @returns {Promise<Object>} Objeto com success, data e status da resposta
     */
    async fetchWithRetry(url, options = {}) {
        let lastError;
        
        // LOOP DE RETRY: Tenta até o número máximo de tentativas configurado
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                console.log(`🔄 Tentativa ${attempt}/${this.retryAttempts} para: ${url}`);
                
                // CONFIGURAÇÃO DA REQUISIÇÃO: Merge das opções com headers padrão
                const response = await fetch(url, {
                    ...options, // Spread das opções fornecidas pelo usuário
                    headers: {
                        'Accept': 'application/json', // Força resposta JSON
                        ...options.headers // Permite override de headers específicos
                    }
                });
                
                // PARSING DA RESPOSTA: Converte resposta para JSON
                const data = await response.json();
                
                // OBJETO DE RESPOSTA PADRONIZADO: Estrutura consistente para todos os chamadores
                const result = {
                    success: response.ok,     // true se status 200-299
                    data: data,               // Dados parseados da resposta
                    status: response.status,  // Código HTTP da resposta
                    attempt: attempt          // Número da tentativa que foi bem-sucedida
                };
                
                console.log(`✅ Requisição bem-sucedida na tentativa ${attempt}: ${response.status}`);
                return result;
                
            } catch (error) {
                // ARMAZENAMENTO DO ERRO: Guarda último erro para eventual propagação
                lastError = error;
                console.warn(`❌ Tentativa ${attempt} falhou:`, error.message);
                
                // ESTRATÉGIA DE BACKOFF: Aguarda antes da próxima tentativa (exceto na última)
                // Isso evita spam de requisições e pode resolver problemas temporários
                if (attempt < this.retryAttempts) {
                    console.log(`⏳ Aguardando ${this.retryDelay}ms antes da próxima tentativa...`);
                    await this.delay(this.retryDelay);
                }
            }
        }
        
        // FALHA FINAL: Se todas as tentativas falharam, propaga o último erro
        console.error(`💥 Todas as ${this.retryAttempts} tentativas falharam para: ${url}`);
        throw lastError;
    }
    
    /**
     * Delay/pausa por um tempo especificado
     * @param {number} ms - Milissegundos para aguardar
     * @returns {Promise} Promise que resolve após o delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Dispara evento customizado
     * @param {string} eventName - Nome do evento
     * @param {Object} detail - Dados do evento
     */
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
        console.log(`Evento disparado: ${eventName}`, detail);
    }
    
    /**
     * Invalida todo o cache
     */
    invalidateCache() {
        console.log('Cache de fabricantes invalidado');
        this.cache.clear();
    }
    
    /**
     * Remove item específico do cache
     * @param {string} key - Chave do cache a ser removida
     */
    removeCacheItem(key) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
            console.log(`Item removido do cache: ${key}`);
        }
    }
    
    /**
     * Obtém estatísticas do loader
     * @returns {Object} Estatísticas atuais
     */
    getStats() {
        return {
            cacheSize: this.cache.size,
            isLoading: this.loadingPromise !== null,
            retryAttempts: this.retryAttempts,
            retryDelay: this.retryDelay
        };
    }
    
    /**
     * Busca fabricantes por nome (busca local no cache)
     * @param {string} searchTerm - Termo de busca
     * @returns {Promise<Array>} Fabricantes que correspondem à busca
     */
    async searchFabricantes(searchTerm) {
        const fabricantes = await this.loadFabricantes();
        
        if (!searchTerm || !searchTerm.trim()) {
            return fabricantes;
        }
        
        const term = searchTerm.toLowerCase().trim();
        
        return fabricantes.filter(fabricante => 
            fabricante.nome.toLowerCase().includes(term) ||
            fabricante.descricao.toLowerCase().includes(term)
        );
    }
}

// Instância global do loader
window.FabricanteLoader = new FabricanteLoader();

// Exporta para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FabricanteLoader;
}

console.log('FabricanteLoader carregado e pronto para uso');