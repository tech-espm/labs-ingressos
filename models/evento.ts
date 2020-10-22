import Sql = require("../infra/sql");

export = class evento {
	public id: number;
	public nome: string;
	public datainicial: string;
	public datafinal: string;
	public horario: string;
	public descricao: string;
    public endereco: string;
    public latitude: number;
    public longitude: number;

    private static validar(e: evento): string {
		e.nome = (e.nome || "").normalize().trim();
		if (e.nome.length < 3 || e.nome.length > 100)
			return "Nome da festa inválido";

		return null;
	}

    //S/n
	public static async listar(): Promise<evento[]> {
		let lista: evento[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select nome, datainicial, datafinal, horario, descricao, endereco, latitude, longitude from evento")) as evento[];
		});

		return lista || [];
	}
    //S/n
	public static async obter(nome: string): Promise<evento> {
		let lista: evento[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select nome, datainicial, datafinal, horario, descricao, endereco, latitude, longitude from evento") as evento[];
		});

		return (lista && lista[0]) || null;
	}
    //S
	public static async criar(e: evento): Promise<string> {
		let res: string;
		if ((res = evento.validar(e)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			try {
				await sql.query("insert into evento (nome, datainicial, datafinal, horario, descricao, endereco, latitude, longitude) values (?,?,?,?,?,?,?,?)", [e.nome, e.datainicial, e.datafinal, e.horario, e.descricao, e.endereco, e.latitude, e.longitude]);
			} catch (e) {
			if (e.code && e.code === "ER_DUP_ENTRY")
				res = `O evento ${e.nome} já existe`;
			else
				throw e;
			}
		});

		return res;
	}
    //S
	public static async alterar(e: evento): Promise<string> {
		let res: string;
		if ((res = evento.validar(e)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			try {
				await sql.query("update evento set endereco = ?, longitude = ?, latitude = ?, horario = ?, nome = ?, datainicial = ?, datafinal = ?, descricao = ? where id = ?", [e.endereco, e.longitude, e.latitude, e.horario, e.nome, e.datafinal, e.datafinal, e.descricao, e.id]);
				res = sql.linhasAfetadas.toString();
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY")
					res = `O assunto ${e.nome} já existe`;
				else
					throw e;
			}
		});

		return res;
	}
    //S
	public static async excluir(id: number): Promise<string> {
		let res: string = null;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("delete from evento where id = ?", [id]);
			res = sql.linhasAfetadas.toString();
		});

		return res;
	}

};
