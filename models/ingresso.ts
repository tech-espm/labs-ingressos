import app = require("teem");
import Evento = require("./evento");

class Ingresso {
	public id: number;
	public idevento: number;
	public idpedido: number;
	public idvenda: number;
	public valor: number;
	public emailenviado: number;
	public emailrecebido: number;

	public static async excluir(id: number, idusuario: number): Promise<string> {
		let erro: string = null;

		await app.sql.connect(async (sql: app.Sql) => {
			const infos: { idevento: number, idpedido: number }[] = await sql.query("select i.idevento, i.idpedido from ingresso i inner join ingresso_venda v on v.id = i.idvenda where v.idusuario = ?", [idusuario]);

			if (!infos || !infos.length) {
				erro = "Ingresso não encontrado";
				return;
			}

			if (infos[0].idpedido) {
				erro = "Ingresso já foi vendido";
				return;
			}

			await sql.beginTransaction();

			await sql.query("delete from ingresso where id = ?", [id]);

			if (!sql.affectedRows)
				erro = "Ingresso não encontrado";
			else
				Evento.atualizarIngressosDisponiveis(sql, infos[0].idevento);

			await sql.commit();
		});

		return erro;
	}

	public static async listarDeEvento(idevento: number): Promise<Ingresso[]> {
		let lista: Ingresso[] = null;

		await app.sql.connect(async (sql: app.Sql) => {
            lista = (await sql.query("select id, idevento, idpedido, idvenda, valor, emailenviado, emailrecebido from ingresso where idevento = ?", [idevento])) as Ingresso[];
		});

		return lista || [];
    }

};

export = Ingresso;
