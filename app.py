from flask import Flask, request, jsonify, render_template, send_from_directory, abort
from flask_cors import CORS
#funçoes que estou chamando no meu conect.py
from conect import inserir_fabricantes, mostrar_imagem, listar_fabricantes, fabricantes_opcoes,inserir_equipamento
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join('static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/inicio')
def inicio():
    return render_template('inicio.html')
# Rota que Busca Serve minhas imagens
@app.route('/uploads/<filename>')
def serve_image(filename):
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except FileNotFoundError:
        abort(404)


#rota que faz o a requisição do meu formulario e faz o method POST no meu banco
@app.route('/api/fabricantes', methods=['POST'])
def receber_dados():
    nome = request.form.get('nome')
    descricao = request.form.get('descricao')
    imagem = request.files.get('imagem')

    if not nome or not descricao or not imagem:
        return jsonify({"erro": "Campos faltando"}), 400

    nome_arquivo = secure_filename(imagem.filename)
    #caminho para salvar a imagem
    caminho_imagem = os.path.join(app.config['UPLOAD_FOLDER'], nome_arquivo)
    print(f"Salvando imagem em: {caminho_imagem}")  
    imagem.save(caminho_imagem)

    try:
        inserir_fabricantes(nome, descricao, nome_arquivo)
        return jsonify({"mensagem": "Inserido com sucesso"}), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    


@app.route('/api/equipamentos', methods=['POST'])  # Ou mude pra /api/equipamentos se preferir
def receber_equip_dados():
    nome = request.form.get('nome')
    id_fabricantes = request.form.get('id_fabricantes')  # <- ADICIONADO: pega do form
    documento = request.files.get('documento')
    imagem = request.files.get('imagem')

    # Validação expandida
    if not nome or not id_fabricantes or not documento or not imagem:
        campos_faltando = []
        if not nome: campos_faltando.append('nome')
        if not id_fabricantes: campos_faltando.append('id_fabricantes')
        if not documento: campos_faltando.append('documento')
        if not imagem: campos_faltando.append('imagem')
        return jsonify({"erro": f"Campos faltando: {', '.join(campos_faltando)}"}), 400

    # Verifica se arquivos não estão vazios
    if documento.filename == '' or imagem.filename == '':
        return jsonify({"erro": "Arquivos enviados estão vazios"}), 400

    try:
        # Primeiro, tenta inserir no BD (passando os NOMES dos arquivos)
        nome_documento = secure_filename(documento.filename)
        nome_arquivo = secure_filename(imagem.filename)
        
        # Chama com os 4 params corretos
        if not inserir_equipamento(nome, int(id_fabricantes), nome_documento, nome_arquivo):  # Converte pra int
            return jsonify({"erro": "Falha na inserção no banco (verifique ID do fabricante)"}), 500
        
        # Se deu certo no BD, aí salva os arquivos
        caminho_imagem = os.path.join(app.config['UPLOAD_FOLDER'], nome_arquivo)
        caminho_documento = os.path.join(app.config['UPLOAD_FOLDER'], nome_documento)
        print(f"Salvando imagem em: {caminho_imagem}")
        imagem.save(caminho_imagem)
        documento.save(caminho_documento)
        
        return jsonify({"mensagem": "Inserido com sucesso"}), 201
        
    except ValueError as ve:  # Pra erros como id_fabricantes não numérico
        return jsonify({"erro": f"ID do fabricante inválido: {str(ve)}"}), 400
    except Exception as e:  # Genérico pra resto
        print(f"Erro na rota: {e}")  # Log pra debug
        return jsonify({"erro": f"Erro interno: {str(e)}"}), 500
    


#Rota que busca minha imagem atraves do caminho
@app.route('/api/imagem/<int:id_fabricante>', methods=['GET'])
def buscar_imagem(id_fabricante):
    caminho = mostrar_imagem(id_fabricante)
    if caminho:
        nome_arquivo = os.path.basename(caminho)
        return jsonify({"caminho": nome_arquivo})
    else:
        return jsonify({"erro": "Imagem não encontrada"}), 404




#rota que faz a requisição para monstrar todos os fabricantes
@app.route('/api/fabricantes', methods=['GET'])
def obter_fabricantes():
    try:
        fabricantes = listar_fabricantes()
        return jsonify({"fabricantes": fabricantes}), 200
    except Exception as e:
        return jsonify({"erro": f"Erro interno: {str(e)}"}), 500



#rota que usada para puxar o nome dos fabricantes e adicionar eles dinamicamente no meu html
@app.route('/api/nome_fabricantes', methods=['GET'])
def get_fabricantes():
    try:
        fabricantes = fabricantes_opcoes()
        return jsonify(fabricantes), 200
    except Exception as e :
        return jsonify({'error': str(e)}), 500
    


#rota para meu acessar o formulario de cadastro do equipamntos
@app.route('/equipamento')
def equip():
    return render_template('equipamento.html')

#rota para acessar parte de sobre
@app.route('/sobre')
def sobre():
    return render_template('sobre.html')

#rota que retorna a lista com os fabricantes
@app.route('/lista')
def lista_fabricantes():
    return render_template('lista.html')

# Rota para acessar o formulario de cadastro dos fabricantes
@app.route('/')
def index():
    return render_template('form.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)