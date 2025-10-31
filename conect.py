import mysql.connector
from mysql.connector import Error
import os

def inserir_fabricantes(nome, descricao, imagem_caminho):
    try:
        conexao = mysql.connector.connect(
            host="localhost",
            database='Data_base',
            user="Your_user",
            password="Your_password"
        )
        if conexao.is_connected():
            cursor = conexao.cursor()
            # Extrai apenas o nome do arquivo de imagem_caminho
            nome_arquivo = os.path.basename(imagem_caminho)
            sql = "INSERT INTO fabricantes (nome, descricao, imagem) VALUES (%s, %s, %s)"
            values = (nome, descricao, nome_arquivo)
            cursor.execute(sql, values)
            conexao.commit()
            print("dados inseridos com sucesso")
    except Error as e:
        print("Erro ao inserir dados", e)
    finally:
        if conexao.is_connected():
            cursor.close()
            conexao.close()

def listar_fabricantes():
    conexao = None
    cursor = None
    try:
        
        conexao = mysql.connector.connect(
            host="localhost",
            database='Data_base',
            user="Your_user",
            password="Your_password",
            ssl_disabled=True
        )
        
        if conexao.is_connected():
            cursor = conexao.cursor() 
            sql = "SELECT id_fabricantes, nome, descricao, imagem, data_criacao FROM fabricantes ORDER BY data_criacao DESC"
            cursor.execute(sql)
            resultados = cursor.fetchall()
            fabricantes = []
                
            for row in resultados:
                fabricante = {
                    'id': row[0],
                    'nome': row[1],
                    'descricao': row[2],
                    'imagem': row[3],
                    'data_criacao': row[4].strftime('%d/%m/%Y %H:%M:%S') if row[4] else None
                }
                fabricantes.append(fabricante)
            return fabricantes

    finally:
        # Fechar cursor e conexão
        if cursor:
            cursor.close()
                
        if conexao and conexao.is_connected():
            conexao.close()
                
#problema indentificado, esta salvando apenas o nome preciso que ele salve o ID
def fabricantes_opcoes():
    conexao = None
    cursor = None
    try:
        conexao = mysql.connector.connect(
            host="localhost",
            database="Data_base",
            user="Your_user",
            password="Your_password"
        )

        if conexao.is_connected():
            cursor = conexao.cursor()
            sql = "SELECT id_fabricantes, nome FROM fabricantes"
            cursor.execute(sql)
            resultados = cursor.fetchall()
            # Retorna uma lista com os nomes dos fabricantes
            return [{'id': row[0], 'nome': row[1]} for row in resultados] if resultados else []
    except Error as e:
        print(f"Erro ao buscar fabricantes: {e}")
        return []
    finally:
        if cursor is not None:
            cursor.close()
        if conexao is not None and conexao.is_connected():
            conexao.close()


def inserir_equipamento(nome, id_fabricantes, documento, imagem):
    conexao = None
    cursor = None
    try:
        conexao = mysql.connector.connect(
            host="localhost",
            database="Data_base",
            user="Your_user",
            password="Your_password"
        )
        if conexao.is_connected():
            cursor = conexao.cursor()
            documento_nome = os.path.basename(documento)
            imagem_nome = os.path.basename(imagem)
            sql = "INSERT INTO modelos (nome, id_fabricantes, documento, imagem) VALUES (%s, %s, %s, %s)"
            valores = (nome, id_fabricantes, documento_nome, imagem_nome)
            cursor.execute(sql, valores)
            conexao.commit()
            return True
    except Error as e:
        print(f"Erro ao inserir equipamento: {e}")
        return False
    finally:
        if cursor is not None:
            cursor.close()
        if conexao is not None and conexao.is_connected():
            conexao.close()

            
def mostrar_imagem(id_fabricante):
    try:
        conexao = mysql.connector.connect(
            host="localhost",
            database='Data_base',
            user="Your_user",
            password="Your_password"
        )

        if conexao.is_connected():
            cursor = conexao.cursor()
            sql = "SELECT imagem FROM fabricantes WHERE id = %s"
            cursor.execute(sql, (id_fabricante,))
            resultado = cursor.fetchone()
            return resultado[0] if resultado else None

    except Error as e:
        print("Erro ao buscar imagem:", e)
        return None

    finally:
        if conexao.is_connected():
            cursor.close()
            conexao.close()


def listar_modelos_por_fabricante(fabricante_id):
    conexao = None
    cursor = None
    try:
        conexao = mysql.connector.connect(
            host="localhost",
            database='your_database',
            user="your_username",
            password="your_password"
        )
        
        if conexao.is_connected():
            cursor = conexao.cursor() 
            sql = """
                SELECT m.id_modelos, m.nome, m.documento, m.imagem, 
                       f.nome as fabricante_nome
                FROM modelos m
                INNER JOIN fabricantes f ON m.id_fabricantes = f.id_fabricantes
                WHERE m.id_fabricantes = %s
                ORDER BY m.nome
            """
            cursor.execute(sql, (fabricante_id,))
            resultados = cursor.fetchall()
            modelos = []
                
            for row in resultados:
                modelo = {
                    'id': row[0],
                    'nome': row[1],
                    'documento': row[2],
                    'imagem': row[3],
                    'fabricante_nome': row[4]
                }
                modelos.append(modelo)
            return modelos

    except Exception as e:
        print(f"Erro ao listar modelos: {e}")
        return []  # Retorna lista vazia em caso de erro
        
    finally:
        if cursor:
            cursor.close()       
        if conexao and conexao.is_connected():
            conexao.close()
