import Sql = require("../infra/sql");
import converterDataISO = require("../utils/converterDataISO");

export = class Termouso {
	public id: number;
	public descricao: string;

    private static validar(tu: Termouso): string {
		if (!tu)
			return "Termo de uso inválido";

		tu.descricao = (tu.descricao || "").normalize().trim();
		if (tu.descricao.length < 3 || tu.descricao.length > 10000)
			return "Tamanho do texto não permitido";

		return null;
	}

	public static async criar(tu: Termouso): Promise<string> {
		let erro: string;
		if ((erro = Termouso.validar(tu)))
			return erro;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("insert into termouso (descricao) values (?)", [tu.descricao]);
		});

		return erro;
	}

	public static async alterar(tu: Termouso): Promise<string> {
		let erro: string;
		if ((erro = Termouso.validar(tu)))
			return erro;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("update termouso set descricao = ? where id = ?", [tu.descricao, tu.id]);
			if (!sql.linhasAfetadas)
				erro = "Perfil não encontrado";
		});

		return erro;
	}

	public static async excluir(id: number): Promise<string> {
		let erro: string = null;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("delete from evento where id = ?", [id]);
			if (!sql.linhasAfetadas)
				erro = "Perfil não encontrado";
		});

		return erro;
	}

};
