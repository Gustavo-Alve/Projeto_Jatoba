CREATE DATABASE IF NOT EXISTS bds_fabricantes;
USE bds_fabricantes;

CREATE TABLE IF NOT EXISTS fabricantes (
    id_fabricantes INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    imagem VARCHAR(200) NOT NULL,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP, --current_timestamp define um valor padrao se nao for inserido nenhuma data
    descricao TEXT
);

CREATE TABLE IF NOT EXISTS modelos (
    id_modelos INT PRIMARY KEY AUTO_INCREMENT,
    id_fabricantes INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    documento VARCHAR(200) NOT NULL,
    imagem VARCHAR(200) NOT NULL,
    FOREIGN KEY (id_fabricantes) REFERENCES fabricantes(id_fabricantes)
);

CREATE TABLE IF NOT EXISTS arquivos (
    id_arquivos INT PRIMARY KEY AUTO_INCREMENT,
    tipo_arquivo ENUM('IMAGEM', 'DOCUMENTO') NOT NULL,
    descricao TEXT,
    id_modelos INT,
    data_upload DATETIME DEFAULT CURRENT_TIMESTAMP,
    link VARCHAR(200), ---onde vou colcoar os links para tutoriais
    FOREIGN KEY (id_modelos) REFERENCES modelos(id_modelos)
);