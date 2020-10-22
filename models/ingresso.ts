import Sql = require("../infra/sql");

export = class ingresso {
	public id: number;
	public tipo: string;
    public valor: number;
    public idusuario: number;
	public idpedido: number;
    public emaildestino: string;
    public emailenviado: number;
    public emailrecebido: number;
    public idevento: number;

    //N
	private static validar(a: ingresso): string {
		a.nome = (a.nome || "").normalize().trim();
		if (a.nome.length < 3 || a.nome.length > 100)
			return "Nome inválido";
		return null;
	}

    //S
	public static async listar(): Promise<ingresso[]> {
		let lista: ingresso[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select tipo, valor from ingresso")) as ingresso[];
		});

		return lista || [];
    }
    
    //N
	public static async criar(i: ingresso): Promise<string> {
		let res: string;
		if ((res = ingresso.validar(i)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			try {
                await sql.query("insert into ingresso (tipo, valor, idusuario, idpedido, emaildestino, emailenviado, emailrecebido) values (?, ?, ?, ?, ?, ?, ?)" [i.tipo, i.valor, i.idusuario, i.idpedido, i.emaildestino, i.emailenviado, i.emailrecebido, i.valor, i.idusuario, i.idpedido, i.emaildestino, i.emailenviado, i.emailrecebido]);
                await sql.query("insert into evento_ingresso (idevento) values (?)");
			} catch (e) {
			if (e.code && e.code === "ER_DUP_ENTRY") {
				res = `O assunto ${i.nome} já existe`;
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
			await sql.query("delete from ingresso where id = ?", [id]);
			res = sql.linhasAfetadas.toString();
		});

		return res;
	}
};
