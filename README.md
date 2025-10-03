# Projeto Técnicos

Sistema web para gerenciamento de fabricantes, modelos de equipamentos e arquivos relacionados.

## 📋 Descrição

Aplicação web desenvolvida em Flask para cadastro e gerenciamento de fabricantes de equipamentos, seus modelos e arquivos associados (imagens e documentos). O sistema permite o upload de imagens, visualização de listagens e organização de informações técnicas.

## 🚀 Tecnologias

- **Backend:** Python 3.x + Flask
- **Frontend:** HTML5, CSS3, JavaScript
- **Banco de Dados:** MySQL
- **Bibliotecas:**
  - Flask-CORS
  - Werkzeug (segurança de arquivos)
  - mysql-connector-python

## 📂 Estrutura do Banco de Dados

### Tabela: `fabricantes`
- `id_fabricantes` (PK)
- `nome`
- `imagem`
- `data_criacao` (timestamp automático)
- `descricao`

### Tabela: `modelos`
- `id_modelos` (PK)
- `id_fabricantes` (FK)
- `nome`
- `descricao`
- `imagem`

### Tabela: `arquivos`
- `id_arquivos` (PK)
- `tipo` (imagem/documento)
- `descricao`
- `id_modelos` (FK)
- `data_upload` (timestamp automático)
- `link`

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Gustavo-Alve/Projeto_tecnicos.git
cd Projeto_tecnicos
```

2. Instale as dependências:
```bash
pip install flask flask-cors mysql-connector-python werkzeug
```

3. Configure o banco de dados:
```bash
mysql -u seu_usuario -p < bds.sql
```

4. Atualize as credenciais do banco em `conect.py`:
```python
host="localhost"
database="data_base"
user="seu_usuario"
password="sua_senha"
```

5. Execute a aplicação:
```bash
python app.py
```

6. Acesse no navegador:
```
http://localhost:5000
```

## 📡 Rotas da API

| Rota | Método | Descrição |
|------|--------|-----------|
| `/` | GET | Página inicial - formulário de cadastro de fabricantes |
| `/api/fabricantes` | POST | Cadastro de novo fabricante com imagem |
| `/uploads/<filename>` | GET | Acesso a imagens uploadadas |
| `/lista` | GET | Listagem de fabricantes cadastrados |
| `/equipamento` | GET | Formulário de cadastro de equipamentos |
| `/sobre` | GET | Página sobre o projeto |

## 💡 Funcionalidades

- ✅ Cadastro de fabricantes com imagem
- ✅ Upload seguro de arquivos
- ✅ Listagem de fabricantes
- ✅ Cadastro de modelos de equipamentos
- ✅ Associação de arquivos a modelos
- ✅ Interface web responsiva

## 🛡️ Segurança

- Utiliza `secure_filename` do Werkzeug para sanitização de nomes de arquivo
- Implementa CORS para controle de acesso
- Gerenciamento seguro de conexões com banco de dados

## 📝 Autor

**Gustavo Alves**
- GitHub: [@Gustavo-Alve](https://github.com/Gustavo-Alve)

## 📅 Data de Criação

Setembro de 2025
