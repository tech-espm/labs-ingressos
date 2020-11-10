import Sql = require("../infra/sql");

export = class Perfil {
	public id: number;
	public nome: string;

	private static validar(p: Perfil): string {
		if (!p)
			return "Perfil inválido";

		p.nome = (p.nome || "").normalize().trim();
		if (p.nome.length < 3 || p.nome.length > 50)
			return "Nome inválido";

		return null;
	}

	public static async listar(): Promise<Perfil[]> {
		let lista: Perfil[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select id, nome from perfil order by nome asc")) as Perfil[];
		});

		return lista || [];
	}

	public static async obter(id: number): Promise<Perfil> {
		let lista: Perfil[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select id, nome from perfil where id = ?", [id])) as Perfil[];
		});

		return (lista && lista[0]) || null;
	}

	public static async criar(p: Perfil): Promise<string> {
		let erro: string;
		if ((erro = Perfil.validar(p)))
			return erro;

		await Sql.conectar(async (sql: Sql) => {
			try {
				await sql.query("insert into perfil (nome) values (?)", [p.nome]);
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY")
				erro = `O perfil ${p.nome} já existe`;
				else
					throw e;
			}
		});

		return erro;
	}

	public static async alterar(p: Perfil): Promise<string> {
		let erro: string;
		if ((erro = Perfil.validar(p)))
			return erro;

		await Sql.conectar(async (sql: Sql) => {
			try {
				await sql.query("update perfil set nome = ? where id = ?", [p.nome, p.id]);
				if (!sql.linhasAfetadas)
					erro = "Perfil não encontrado";
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY")
					erro = `O perfil ${p.nome} já existe`;
				else
					throw e;
			}
		});

		return erro;
	}

	public static async excluir(id: number): Promise<string> {
		let erro: string = null;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("delete from perfil where id = ?", [id]);
			if (!sql.linhasAfetadas)
				erro = "Perfil não encontrado";
		});

		return erro;
	}
};
