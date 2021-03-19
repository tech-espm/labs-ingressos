import app = require("teem");
import { randomBytes } from "crypto";
import express = require("express");
// https://www.npmjs.com/package/lru-cache
import GeradorHash = require("../utils/geradorHash");
import appsettings = require("../appsettings");
import intToHex = require("../utils/intToHex");
import converterDataISO = require("../utils/converterDataISO");
import emailValido = require("../utils/emailValido");

class Usuario {

	public static readonly CaminhoRelativoPerfil = "public/imagens/perfil/";

	public static readonly IdAdmin = 1;
	public static readonly IdPerfilAdmin = 1;
	public static readonly IdPerfilComum = 2;

	public id: number;
	public login: string;
	public nome: string;
	public idperfil: number;
	public versao: number;
	public senha: string;
	public idtermouso: number;
	public nascimento: string;
	public telefone: string;
	public faculdade: string;
	public criacao: string;

	// Utilizados apenas através do cookie
	public admin: boolean;

	// Não estamos utilizando Usuario.cookie como middleware, porque existem muitas requests
	// que não precisam validar o usuário logado, e agora, é assíncrono...
	// http://expressjs.com/pt-br/guide/writing-middleware.html
	//public static cookie(req: express.Request, res: express.Response, next: Function): void {
	public static async cookie(req: express.Request, res: express.Response = null, admin: boolean = false): Promise<Usuario> {
		let cookieStr = req.cookies[appsettings.cookie] as string;
		if (!cookieStr || cookieStr.length !== 48) {
			if (res) {
				res.statusCode = 403;
				res.json("Não permitido");
			}
			return null;
		} else {
			let id = parseInt(cookieStr.substr(0, 8), 16) ^ appsettings.usuarioHashId;
			let usuario: Usuario = null;

			await app.sql.connect(async (sql: app.Sql) => {
				let rows = await sql.query("select id, login, nome, idperfil, versao, token from usuario where id = ?", [id]);
				let row;

				if (!rows || !rows.length || !(row = rows[0]))
					return;

				let token = cookieStr.substring(16);

				if (!row.token || token !== (row.token as string))
					return;

				let u = new Usuario();
				u.id = id;
				u.login = row.login as string;
				u.nome = row.nome as string;
				u.idperfil = row.idperfil as number;
				u.versao = row.versao as number;
				u.admin = (u.idperfil === Usuario.IdPerfilAdmin);

				usuario = u;
			});

			if (admin && usuario && usuario.idperfil !== Usuario.IdPerfilAdmin)
				usuario = null;
			if (!usuario && res) {
				res.statusCode = 403;
				res.json("Não permitido");
			}
			return usuario;
		}
	}

	private static gerarTokenCookie(id: number): [string, string] {
		let idStr = intToHex(id ^ appsettings.usuarioHashId);
		let idExtra = intToHex(0);
		let token = randomBytes(16).toString("hex");
		let cookieStr = idStr + idExtra + token;
		return [token, cookieStr];
	}

	public static async efetuarLogin(login: string, senha: string, res: express.Response): Promise<[string, Usuario]> {
		if (!login || !senha)
			return ["Usuário ou senha inválidos", null];

		let r: string = null;
		let u: Usuario = null;

		await app.sql.connect(async (sql: app.Sql) => {
			login = login.normalize().trim().toLowerCase();

			let rows = await sql.query("select id, nome, idperfil, versao, senha from usuario where login = ?", [login]);
			let row;
			let ok: boolean;

			if (!rows || !rows.length || !(row = rows[0]) || !(ok = await GeradorHash.validarSenha(senha.normalize(), row.senha))) {
				r = "Usuário ou senha inválidos";
				return;
			}

			let [token, cookieStr] = Usuario.gerarTokenCookie(row.id);

			await sql.query("update usuario set token = ? where id = ?", [token, row.id]);

			u = new Usuario();
			u.id = row.id;
			u.login = login;
			u.nome = row.nome as string;
			u.idperfil = row.idperfil as number;
			u.versao = row.versao as number;
			u.admin = (u.idperfil === Usuario.IdPerfilAdmin);

			res.cookie(appsettings.cookie, cookieStr, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true, path: "/", secure: appsettings.cookieSecure });
		});

		return [r, u];
	}

	public async efetuarLogout(res: express.Response): Promise<void> {
		await app.sql.connect(async (sql: app.Sql) => {
			await sql.query("update usuario set token = null where id = ?", [this.id]);

			res.cookie(appsettings.cookie, "", { expires: new Date(0), httpOnly: true, path: "/", secure: appsettings.cookieSecure });
		});
	}

	public async alterarPerfil(res: express.Response, nome: string, senhaAtual: string, novaSenha: string, imagemPerfil: string): Promise<string> {
		nome = (nome || "").normalize().trim();
		if (nome.length < 3 || nome.length > 100)
			return "Nome inválido";

		if (!!senhaAtual !== !!novaSenha || (novaSenha && novaSenha.length > 40))
			return "Senha inválida";

		let r: string = null;

		await app.sql.connect(async (sql: app.Sql) => {
			if (senhaAtual) {
				let hash = await sql.scalar("select senha from usuario where id = ?", [this.id]) as string;
				if (!await GeradorHash.validarSenha(senhaAtual.normalize(), hash)) {
					r = "Senha atual não confere";
					return;
				}

				hash = await GeradorHash.criarHash(novaSenha.normalize());

				let [token, cookieStr] = Usuario.gerarTokenCookie(this.id);

				await sql.query("update usuario set nome = ?, senha = ?, token = ? where id = ?", [nome, hash, token, this.id]);

				this.nome = nome;

				res.cookie(appsettings.cookie, cookieStr, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true, path: "/", secure: appsettings.cookieSecure });
			} else {
				await sql.query("update usuario set nome = ? where id = ?", [nome, this.id]);

				this.nome = nome;
			}

			if (imagemPerfil) {
				if (!imagemPerfil.startsWith("data:image/jpeg;base64,") || imagemPerfil.length === 23) {
					r = (senhaAtual ? "A senha foi alterada com sucesso, mas a imagem de perfil é inválida" : "Imagem de perfil inválida");
					return;
				}

				if (imagemPerfil.length > (23 + (256 * 1024 * 4 / 3))) {
					r = (senhaAtual ? "A senha foi alterada com sucesso, mas a imagem de perfil é muito grande" : "Imagem de perfil muito grande");
					return;
				}

				try {
					await app.fileSystem.saveBuffer(Usuario.CaminhoRelativoPerfil + this.id + ".jpg", Buffer.from(imagemPerfil.substr(23), "base64"));

					this.versao++;

					await sql.query("update usuario set versao = ? where id = ?", [this.versao, this.id]);
				} catch (ex) {
					r = (senhaAtual ? "A senha foi alterada com sucesso, mas ocorreu um erro ao gravar a imagem de perfil" : "Erro ao gravar a imagem de perfil");
					return;
				}
			}
		});

		return r;
	}

	private static validar(u: Usuario): string {
		if (!u)
			return "Usuário inválido";

		u.nome = (u.nome || "").normalize().trim();
		if (u.nome.length < 3 || u.nome.length > 100)
			return "Nome inválido";
		
		u.nascimento = converterDataISO(u.nascimento);
		if (!u.nascimento)
			return "Data de nascimento inválida";

		u.telefone = (u.telefone || "").normalize().trim();
		if (u.telefone.length < 3 || u.telefone.length > 30)
			return "Telefone inválido";

		u.faculdade = (u.faculdade || "").normalize().trim();
		if (u.faculdade.length < 3 || u.faculdade.length > 50)
			return "Faculdade inválida";

		u.idperfil = parseInt(u.idperfil as any);
		if (isNaN(u.idperfil))
			return "Perfil inválido";

		return null;
	}

	public static async listar(): Promise<Usuario[]> {
		let lista: Usuario[] = null;

		await app.sql.connect(async (sql: app.Sql) => {
			lista = await sql.query("select u.id, u.login, u.nome, p.nome perfil, u.versao, date_format(nascimento, '%d/%m/%Y') nascimento, telefone, faculdade, date_format(u.criacao, '%d/%m/%Y') criacao from usuario u inner join perfil p on p.id = u.idperfil order by u.login asc") as Usuario[];
		});

		return (lista || []);
	}

	public static async obter(id: number): Promise<Usuario> {
		let lista: Usuario[] = null;

		await app.sql.connect(async (sql: app.Sql) => {
			lista = await sql.query("select id, login, nome, idperfil, versao, idtermouso, date_format(nascimento, '%d/%m/%Y') nascimento, telefone, faculdade, date_format(criacao, '%d/%m/%Y') criacao from usuario where id = ?", [id]) as Usuario[];
		});

		return ((lista && lista[0]) || null);
	}

	public static async criar(u: Usuario): Promise<string> {
		let res: string;
		if ((res = Usuario.validar(u)))
			return res;

		u.login = (u.login || "").normalize().trim().toLowerCase();
		if (u.login.length < 3 || u.login.length > 100 || !emailValido(u.login))
			return "Login inválido";

		u.senha = (u.senha || "").normalize();
		if (u.senha.length < 6 || u.senha.length > 16)
			return "Senha inválida";

		await app.sql.connect(async (sql: app.Sql) => {
			try {
				await sql.query("insert into usuario (login, nome, idperfil, versao, senha, idtermouso, nascimento, telefone, faculdade, criacao) values (?, ?, ?, 0, ?, 0, ?, ?, ?, now())", [u.login, u.nome, u.idperfil, await GeradorHash.criarHash(u.senha), u.nascimento, u.telefone, u.faculdade]);
			} catch (e) {
				if (e.code) {
					switch (e.code) {
						case "ER_DUP_ENTRY":
							res = `O e-mail ${u.login} já está em uso`;
							break;
						case "ER_NO_REFERENCED_ROW":
						case "ER_NO_REFERENCED_ROW_2":
							res = "Perfil não encontrado";
							break;
						default:
							throw e;
					}
				} else {
					throw e;
				}
			}
		});

		return res;
	}

	public static async alterar(u: Usuario): Promise<string> {
		let erro: string;
		if ((erro = Usuario.validar(u)))
			return erro;

		if (u.id === Usuario.IdAdmin)
			return "Não é possível editar o usuário administrador principal";

		await app.sql.connect(async (sql: app.Sql) => {
			await sql.query("update usuario set nome = ?, idperfil = ?, nascimento = ?, telefone = ?, faculdade = ? where id = ?", [u.nome, u.idperfil, u.nascimento, u.telefone, u.faculdade, u.id]);
			if (!sql.affectedRows)
				erro = "Usuário não encontrado";
		});

		return erro;
	}

	public static async excluir(id: number): Promise<string> {
		if (id === Usuario.IdAdmin)
			return "Não é possível excluir o usuário administrador principal";

		let res: string = null;

		await app.sql.connect(async (sql: app.Sql) => {
			await sql.query("delete from usuario where id = ?", [id]);
			res = sql.affectedRows.toString();
		});

		return res;
	}

	public static async redefinirSenha(id: number): Promise<string> {
		let res: string = null;

		await app.sql.connect(async (sql: app.Sql) => {
			let login = await sql.scalar("select login from usuario where id = ?", [id]) as string;
			if (!login) {
				res = "0";
			} else {
				await sql.query("update usuario set token = null, senha = ? where id = ?", [appsettings.usuarioHashSenhaPadrao, id]);
				res = sql.affectedRows.toString();
			}
		});

		return res;
	}
}

export = Usuario;
