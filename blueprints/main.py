from flask import Blueprint, render_template

main_bp = Blueprint('main', __name__)
@main_bp.route('/')
def index():
    return render_template('form.html')


inicio_bp = Blueprint('inicio', __name__)
@inicio_bp.route('/inicio')
def inicio():
    return render_template('inicio.html')


equipamento_bp = Blueprint('equipamento', __name__)
@equipamento_bp.route('/equipamento')
def equip():
    return render_template('equipamento.html')


sobre_bp = Blueprint('sobre', __name__)
@sobre_bp.route('/sobre')
def sobre():
    return render_template('sobre.html')


lista_bp = Blueprint('lista', __name__)
@lista_bp.route('/lista')
def lista_fabricantes():
    return render_template('lista.html')
