import Sql = require("../infra/sql");
import converterDataISO = require("../utils/converterDataISO");

export = class Evento {
	public id: number;
	public nome: string;
	public datainicial: string;
	public datafinal: string;
	public horario: string;
	public descricao: string;
    public endereco: string;
    public latitude: number;
    public longitude: number;

    private static validar(e: Evento): string {
		if (!e)
			return "Evento inválido";

		e.nome = (e.nome || "").normalize().trim();
		if (e.nome.length < 3 || e.nome.length > 100)
			return "Nome inválido";

		e.datainicial = converterDataISO(e.datainicial);
		if (!e.datainicial)
			return "Data inicial inválida";

		e.datafinal = converterDataISO(e.datafinal);
		if (!e.datafinal)
			return "Data final inválida";

		e.horario = (e.horario || "").normalize().trim();
		if (e.horario.length < 3 || e.horario.length > 40)
			return "Horário inválido";

		e.descricao = (e.descricao || "").normalize().trim();
		if (e.descricao.length < 3 || e.descricao.length > 8000)
			return "Descrição inválido";

		e.endereco = (e.endereco || "").normalize().trim();
		if (e.endereco.length < 3 || e.endereco.length > 100)
			return "Endereço inválido";

		e.latitude = parseFloat(e.latitude as any);
		if (isNaN(e.latitude) || e.latitude < -90 || e.latitude > 90)
			return "Latitude inválida";

		e.longitude = parseFloat(e.longitude as any);
		if (isNaN(e.longitude) || e.longitude < -180 || e.longitude > 180)
			return "Longitude inválida";

		return null;
	}

	public static async listar(): Promise<Evento[]> {
		let lista: Evento[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select id, nome, date_format(datainicial, '%d/%m/%Y') datainicial, date_format(datafinal, '%d/%m/%Y') datafinal, horario, endereco, latitude, longitude from evento")) as Evento[];
		});

		return lista || [];
	}

	public static async obter(id: number): Promise<Evento> {
		let lista: Evento[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select id, nome, date_format(datainicial, '%d/%m/%Y') datainicial, date_format(datafinal, '%d/%m/%Y') datafinal, horario, descricao, endereco, latitude, longitude from evento where id = ?", [id])) as Evento[];
		});
		
		return (lista && lista[0]) || null;
	}

	public static async criar(e: Evento): Promise<string> {
		let res: string;
		if ((res = Evento.validar(e)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("insert into evento (nome, datainicial, datafinal, horario, descricao, endereco, latitude, longitude) values (?,?,?,?,?,?,?,?)", [e.nome, e.datainicial, e.datafinal, e.horario, e.descricao, e.endereco, e.latitude, e.longitude]);
		});

		return res;
	}

	public static async alterar(e: Evento): Promise<string> {
		let res: string;
		if ((res = Evento.validar(e)))
			return res;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("update evento set endereco = ?, longitude = ?, latitude = ?, horario = ?, nome = ?, datainicial = ?, datafinal = ?, descricao = ? where id = ?", [e.endereco, e.longitude, e.latitude, e.horario, e.nome, e.datafinal, e.datafinal, e.descricao, e.id]);
		});

		return res;
	}

	public static async excluir(id: number): Promise<string> {
		let res: string = null;

		await Sql.conectar(async (sql: Sql) => {
			await sql.query("delete from evento where id = ?", [id]);
		});

		return res;
	}

};
