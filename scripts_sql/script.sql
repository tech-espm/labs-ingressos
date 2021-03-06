CREATE DATABASE IF NOT EXISTS ingressos;
USE ingressos;

-- DROP TABLE IF EXISTS perfil;
CREATE TABLE perfil (
  id int NOT NULL,
  nome varchar(50) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY perfil_nome_UN (nome)
);

INSERT INTO perfil (id, nome) VALUES (1, 'Administrador'), (2, 'Comum');

-- DROP TABLE IF EXISTS termouso;
CREATE TABLE termouso (
  id int NOT NULL AUTO_INCREMENT,
  descricao text NOT NULL,
  PRIMARY KEY (id)
);

INSERT INTO termouso (descricao) VALUES ('Termo de uso');

-- DROP TABLE IF EXISTS usuario;
CREATE TABLE usuario (
  id int NOT NULL AUTO_INCREMENT,
  login varchar(100) NOT NULL,
  nome varchar(100) NOT NULL,
  idperfil int NOT NULL,
  versao int NOT NULL,
  senha varchar(100) NOT NULL,
  token char(32) DEFAULT NULL,
  idtermouso int NOT NULL,
  nascimento datetime NOT NULL,
  telefone varchar(30) NOT NULL,
  faculdade varchar(50) NOT NULL,
  criacao datetime NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY usuario_login_UN (login),
  KEY usuario_idperfil_FK_idx (idperfil),
  CONSTRAINT usuario_idperfil_FK FOREIGN KEY (idperfil) REFERENCES perfil (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

INSERT INTO usuario (login, nome, idperfil, versao, senha, token, criacao, idtermouso, nascimento, telefone, faculdade) VALUES ('admin@safetix.com.br', 'Administrador', 1, 0, 'peTcC99vkvvLqGQL7mdhGuJZIvL2iMEqvCNvZw3475PJ:JVyo1Pg2HyDyw9aSOd3gNPT30KdEyiUYCjs7RUzSoYGN', NULL, NOW(), 0, '2000-01-01', '', '');

-- DROP TABLE IF EXISTS tipo;
CREATE TABLE tipo (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(40) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY tipo_nome_UN (nome)
);

-- DROP TABLE IF EXISTS notificacao;
CREATE TABLE notificacao (
  id int NOT NULL AUTO_INCREMENT,
  descricao varchar(100) NOT NULL,
  idtipo int NOT NULL,
  idusuarioorigem int NOT NULL,
  idusuariodestino int NOT NULL,
  flagvista tinyint(4) NOT NULL,
  criacao datetime NOT NULL,
  PRIMARY KEY (id),
  KEY notificacao_idtipo_FK_idx (idtipo),
  KEY notificacao_idusuarioorigem_FK_idx (idusuarioorigem),
  KEY notificacao_idusuariodestino_FK_idx (idusuariodestino),
  CONSTRAINT notificacao_idtipo_FK FOREIGN KEY (idtipo) REFERENCES tipo (id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT notificacao_idusuarioorigem_FK FOREIGN KEY (idusuarioorigem) REFERENCES usuario (id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT notificacao_idusuariodestino_FK FOREIGN KEY (idusuariodestino) REFERENCES usuario (id) ON DELETE CASCADE ON UPDATE RESTRICT
);

-- DROP TABLE IF EXISTS evento;
CREATE TABLE evento (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(100) NOT NULL,
  datainicial datetime NOT NULL,
  datafinal datetime NOT NULL,
  horario varchar(40) NOT NULL,
  descricao text NOT NULL,
  ingressosdisponiveis int NOT NULL,
  endereco varchar(100) NOT NULL,
  latitude float NOT NULL,
  longitude float NOT NULL,
  PRIMARY KEY (id),
  FULLTEXT (nome)
);

-- DROP TABLE IF EXISTS pedido;
CREATE TABLE pedido (
  id bigint NOT NULL AUTO_INCREMENT,
  idusuario int NOT NULL,
  idstatus int NOT NULL,
  data datetime NOT NULL,
  valortotal float NOT NULL,
  PRIMARY KEY (id),
  KEY pedido_idusuario_FK_idx (idusuario),
  KEY pedido_idstatus_FK_idx (idstatus),
  CONSTRAINT pedido_idusuario_FK FOREIGN KEY (idusuario) REFERENCES usuario (id) ON DELETE CASCADE ON UPDATE RESTRICT
);

CREATE TABLE ingresso_tipo (
  id int NOT NULL,
  nome varchar(50) NOT NULL,
  PRIMARY KEY (id)
);

INSERT INTO ingresso_tipo (id, nome) VALUES (1, 'Inteira'), (2, 'Meia'), (3, 'Meia Universidade');

CREATE TABLE ingresso_setor (
  id int NOT NULL,
  nome varchar(50) NOT NULL,
  PRIMARY KEY (id)
);

INSERT INTO ingresso_setor (id, nome) VALUES (1, 'Pista'), (2, 'Área Vip'), (3, 'Camarote');

CREATE TABLE ingresso_venda (
  id bigint NOT NULL AUTO_INCREMENT,
  idevento int NOT NULL,
  idusuario int NOT NULL,
  idtipo int NOT NULL,
  idsetor int NOT NULL,
  valor float NOT NULL,
  ingressosdisponiveis int NOT NULL,
  data datetime NOT NULL,
  PRIMARY KEY (id),
  KEY ingresso_venda_idevento_idusuario_FK_idx (idevento, idusuario),
  KEY ingresso_venda_idevento_ingressosdisponiveis_idx (idevento, ingressosdisponiveis),
  KEY ingresso_venda_idusuario_FK_idx (idusuario),
  KEY ingresso_venda_idtipo_FK_idx (idtipo),
  KEY ingresso_venda_idsetor_FK_idx (idsetor),
  CONSTRAINT ingresso_venda_idevento_FK FOREIGN KEY (idevento) REFERENCES evento (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT ingresso_venda_idusuario_FK FOREIGN KEY (idusuario) REFERENCES usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT ingresso_venda_idtipo_FK FOREIGN KEY (idtipo) REFERENCES ingresso_tipo (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT ingresso_venda_idsetor_FK FOREIGN KEY (idsetor) REFERENCES ingresso_setor (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE ingresso (
  id bigint NOT NULL AUTO_INCREMENT,
  idevento int NOT NULL,
  idpedido bigint NOT NULL,
  idvenda bigint NOT NULL,
  emailenviado tinyint(4) NOT NULL,
  emailrecebido tinyint(4) NOT NULL,
  PRIMARY KEY (id),
  KEY ingresso_idevento_idpedido_FK_idx (idevento, idpedido),
  KEY ingresso_idpedido_FK_idx (idpedido),
  KEY ingresso_idvenda_idpedido_FK_idx (idvenda, idpedido),
  CONSTRAINT ingresso_idevento_FK FOREIGN KEY (idevento) REFERENCES evento (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT ingresso_idvenda_FK FOREIGN KEY (idvenda) REFERENCES ingresso_venda (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);
