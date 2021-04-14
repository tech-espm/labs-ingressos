import app = require("teem");
import converterDataISO = require("../utils/converterDataISO");

class Evento {
	public id: number;
	public nome: string;
	public datainicial: string;
	public datafinal: string;
	public horario: string;
	public descricao: string;
	public ingressosdisponiveis: number;
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

		e.latitude = parseFloat((e.latitude|| 0).toString().replace(",", "."));
		if (isNaN(e.latitude) || e.latitude < -90 || e.latitude > 90)
			return "Latitude inválida";

		e.longitude = parseFloat((e.longitude|| 0).toString().replace(",", "."));
		if (isNaN(e.longitude) || e.longitude < -180 || e.longitude > 180)
			return "Longitude inválida";

		return null;
	}

	public static async listar(): Promise<Evento[]> {
		let lista: Evento[] = null;

		await app.sql.connect(async (sql: app.Sql) => {
			lista = (await sql.query("select id, nome, ingressosdisponiveis, date_format(datainicial, '%d/%m/%Y') datainicial, date_format(datafinal, '%d/%m/%Y') datafinal, horario, endereco, latitude, longitude from evento")) as Evento[];
		});

		return lista || [];
	}

	public static async listarBusca(nome: string, data: string): Promise<Evento[]> {
		let lista: Evento[] = null;

		await app.sql.connect(async (sql: app.Sql) => {
			// https://dev.mysql.com/doc/refman/8.0/en/fulltext-search.html
			// https://dev.mysql.com/doc/refman/8.0/en/fulltext-natural-language.html

			let query = "select id, nome, ingressosdisponiveis, date_format(datainicial, '%d/%m/%Y') datainicial, date_format(datafinal, '%d/%m/%Y') datafinal, horario, endereco, latitude, longitude from evento ";
			let parametros: string[] = [];
			let temWhere = false;

			if (nome) {
				if (!temWhere) {
					query += " where ";
					temWhere = true;
				} else {
					query += " and ";
				}
				query += " match (nome) against (? in natural language mode) ";
				parametros.push(nome);
			}

			data = converterDataISO(data);
			if (data) {
				if (!temWhere) {
					query += " where ";
					temWhere = true;
				} else {
					query += " and ";
				}
				query += " dataInicial <= ? and dataFinal >= ? ";
				parametros.push(data, data);
			}

			lista = (await sql.query(query, parametros)) as Evento[];
		});

		return lista || [];
	}

	public static async obter(id: number, dataISO: boolean): Promise<Evento> {
		let lista: Evento[] = null;

		await app.sql.connect(async (sql: app.Sql) => {
			lista = (await sql.query(
				dataISO ?
				"select id, nome, date_format(datainicial, '%Y-%m-%d') datainicial, date_format(datafinal, '%Y-%m-%d') datafinal, horario, descricao, ingressosdisponiveis, endereco, latitude, longitude from evento where id = ?" :
				"select id, nome, date_format(datainicial, '%d/%m/%Y') datainicial, date_format(datafinal, '%d/%m/%Y') datafinal, horario, descricao, ingressosdisponiveis, endereco, latitude, longitude from evento where id = ?"
				, [id])) as Evento[];
		});
		
		return (lista && lista[0]) || null;
	}

	public static async criar(e: Evento, imagem: app.UploadedFile): Promise<string> {
		let erro: string;
		if ((erro = Evento.validar(e)))
			return erro;

		if (!imagem)
			return "Imagem inválida";

		if (imagem.size < 100)
			return "Imagem muito pequena";

		if (imagem.size > 524288)
			return "Imagem não pode ter mais de 500KB";

		await app.sql.connect(async (sql: app.Sql) => {
			await sql.beginTransaction();

			await sql.query("insert into evento (nome, datainicial, datafinal, horario, descricao, ingressosdisponiveis, endereco, latitude, longitude) values (?,?,?,?,?,0,?,?,?)", [e.nome, e.datainicial, e.datafinal, e.horario, e.descricao, e.endereco, e.latitude, e.longitude]);

			const id = await sql.scalar("select last_insert_id()") as number;

			await app.fileSystem.saveUploadedFile("public/imagens/evento/" + id + ".jpg", imagem);

			await sql.commit();
		});

		return erro;
	}

	public static async alterar(e: Evento, imagem: app.UploadedFile): Promise<string> {
		let erro: string;
		if ((erro = Evento.validar(e)))
			return erro;

		if (imagem) {
			if (imagem.size < 100)
				return "Imagem muito pequena";

			if (imagem.size > 524288)
				return "Imagem não pode ter mais de 500KB";
		}

		await app.sql.connect(async (sql: app.Sql) => {
			await sql.beginTransaction();

			await sql.query("update evento set endereco = ?, longitude = ?, latitude = ?, horario = ?, nome = ?, datainicial = ?, datafinal = ?, descricao = ? where id = ?", [e.endereco, e.longitude, e.latitude, e.horario, e.nome, e.datafinal, e.datafinal, e.descricao, e.id]);

			if (!sql.affectedRows) {
				erro = "Evento não encontrado";
			} else {
				if (imagem) {
					await app.fileSystem.saveUploadedFile("public/imagens/evento/" + e.id + ".jpg", imagem);
				}
			}

			await sql.commit();
		});

		return erro;
	}

	public static async atualizarIngressosDisponiveis(sql: app.Sql, id: number): Promise<void> {
		await sql.query("update evento set ingressosdisponiveis = (select count(*) from ingresso where idevento = ? and idpedido = 0) where id = ?", [id, id]);
	}

	public static async excluir(id: number): Promise<string> {
		let erro: string = null;

		await app.sql.connect(async (sql: app.Sql) => {
			await sql.query("delete from evento where id = ?", [id]);
			if (!sql.affectedRows)
				erro = "Evento não encontrado";
		});

		return erro;
	}

};

export = Evento;
