import app = require("teem");
import Evento = require("./evento");
import Venda = require("./venda");

class Ingresso {
	public id: number;
	public idevento: number;
	public idpedido: number;
	public idvenda: number;
	public emailenviado: number;
	public emailrecebido: number;

	public static async excluir(id: number, idusuario: number): Promise<string> {
		let erro: string = null;

		await app.sql.connect(async (sql: app.Sql) => {
			const infos: { idevento: number, idpedido: number, idvenda: number }[] = await sql.query("select i.idevento, i.idpedido, i.idvenda from ingresso i inner join ingresso_venda v on v.id = i.idvenda where v.idusuario = ?", [idusuario]);

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

			if (!sql.affectedRows) {
				erro = "Ingresso não encontrado";
			} else {
				Evento.atualizarIngressosDisponiveis(sql, infos[0].idevento);
				Venda.atualizarIngressosDisponiveis(sql, infos[0].idvenda);
			}

			await sql.commit();
		});

		return erro;
	}

};

export = Ingresso;
