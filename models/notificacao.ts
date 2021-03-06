﻿import app = require("teem");

export = class Notificacao {
	public id: number;
	public descricao: string;
	public idtipo: number;
	public idusuarioorigem: number;
	public idusuariodestino: number;
	public flagvista: number;
	public criacao: string;

	public static async listarDeUsuario(idusuariodestino: number): Promise<Notificacao[]> {
		let lista: Notificacao[] = null;

		await app.sql.connect(async (sql: app.Sql) => {
			lista = await sql.query("select n.id, n.descricao, n.idtipo, t.nome tipo, n.flagvista, date_format(criacao, '%d/%m/%Y') criacao from notificacao n inner join tipo t on t.id = n.idtipo where n.idusuariodestino = ? order by id desc", [idusuariodestino]) as Notificacao[];
		});

		return lista || [];
	}

	public static async criar(n: Notificacao): Promise<string> {
		let erro: string = null;

		await app.sql.connect(async (sql: app.Sql) => {
			await sql.query("insert into notificacao (descricao, idtipo, idusuarioorigem, idusuariodestino, flagvista, criacao) values (?, ?, ?, ?, 0, now())", [n.descricao, n.idtipo, n.idusuarioorigem, n.idusuariodestino]);
		});

		return erro;
	}

	public static async marcarVista(id: number): Promise<string> {
		let erro: string = null;

		await app.sql.connect(async (sql: app.Sql) => {
			await sql.query("update notificacao set flagvista = 1 where id = ?", [id]);
			if (!sql.affectedRows)
				erro = "Notificação não encontrada"
		});

		return erro;
	}

	public static async excluir(id: number): Promise<string> {
		let erro: string = null;

		await app.sql.connect(async (sql: app.Sql) => {
			await sql.query("delete from notificacao where id = ?", [id]);
			if (!sql.affectedRows)
				erro = "Notificação não encontrada"
		});

		return erro;
	}
};
