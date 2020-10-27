import Sql = require("../infra/sql");
import emailValido = require("../utils/emailValido");

export = class Ingresso {
	public id: number;
	public tipo: string;
    public valor: number;
    public idevento: number;
    public idusuario: number;
	public idpedido: number;
    public emaildestino: string;
    public emailenviado: number;
    public emailrecebido: number;

	private static validar(i: Ingresso): string {
		if (!i)
			return "Ingresso inválido";

		i.tipo = (i.tipo || "").normalize().trim();
		if (i.tipo.length < 3 || i.tipo.length > 50)
			return "Tipo inválido";

		i.valor = parseFloat(i.valor as any);
		if (isNaN(i.valor) || i.valor < 0)
			return "Valor inválido";

		i.idevento = parseFloat(i.idevento as any);
		if (isNaN(i.idevento))
			return "Evento inválido";

		i.idusuario = parseFloat(i.idusuario as any);
		if (isNaN(i.idusuario))
			return "Usuário inválido";

		i.idpedido = parseFloat(i.idpedido as any);
		if (isNaN(i.idpedido))
			return "Pedido inválido";

		i.emaildestino = (i.emaildestino || "").normalize().trim();
		if (i.emaildestino && (i.emaildestino.length > 100 || !emailValido(i.emaildestino)))
			return "E-mail destino inválido";

		return null;
	}

	public static async listar(): Promise<Ingresso[]> {
		let lista: Ingresso[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select i.tipo, i.valor, i.idevento, e.nome evento from ingresso i inner join evento e on e.id = i.idevento")) as Ingresso[];
		});

		return lista || [];
    }

	public static async criar(i: Ingresso): Promise<string> {
		let res: string;
		if ((res = Ingresso.validar(i)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("insert into ingresso (tipo, valor, idevento, idusuario, idpedido, emaildestino, emailenviado, emailrecebido) values (?, ?, ?, ?, ?, ?, 0, 0)" [i.tipo, i.valor, i.idevento, i.idusuario, i.idpedido, i.emaildestino]);
		});

		return res;
    }

	public static async alterar(i: Ingresso): Promise<string> {
		let res: string;
		if ((res = Ingresso.validar(i)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("update ingresso set tipo = ?, valor = ? where id = ?" [i.tipo, i.valor, i.id]);
		});

		return res;
    }

	public static async excluir(id: number): Promise<string> {
		let res: string = null;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("delete from ingresso where id = ?", [id]);
		});

		return res;
	}
};
