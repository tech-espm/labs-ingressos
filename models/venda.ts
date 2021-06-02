import app = require("teem");
import Evento = require("./evento");

class Venda {
	public id: number;
	public idevento: number;
	public idusuario: number;
	public idtipo: number;
	public idsetor: number;
	public ingressosdisponiveis: number;
	public valor: number;
	public data: string;

	private static validar(v: Venda): string {
		if (!v)
			return "Ingresso inválido";

		v.idevento = parseInt(v.idevento as any);
		if (isNaN(v.idevento))
			return "Evento inválido";

		v.idusuario = parseInt(v.idusuario as any);
		if (isNaN(v.idusuario))
			return "Usuário inválido";

		v.idtipo = parseInt(v.idtipo as any);
		if (isNaN(v.idtipo))
			return "Tipo inválido";

		v.idsetor = parseInt(v.idsetor as any);
		if (isNaN(v.idsetor))
			return "Setor inválido";

		v.ingressosdisponiveis = parseInt(v.ingressosdisponiveis as any);
		if (isNaN(v.ingressosdisponiveis) || v.ingressosdisponiveis <= 0)
			return "Quantidade inválida";

		v.valor = parseFloat(v.valor.toString().replace(",", "."));
		if (isNaN(v.valor) || v.valor <= 0)
			return "Valor unitário inválido";

		return null;
	}

	public static async criar(v: Venda, comprovante: app.UploadedFile): Promise<string> {
		let erro: string;
		if ((erro = Venda.validar(v)))
			return erro;

		if (!comprovante || comprovante.mimetype !== "image/jpeg" || !comprovante.buffer || comprovante.buffer.length < 100 || comprovante.buffer.length > (1024 * 1024))
			return "Comprovante inválido";

		await app.sql.connect(async (sql: app.Sql) => {
			try {
				await sql.beginTransaction();

				await sql.query("insert into ingresso_venda (idevento, idusuario, idtipo, idsetor, ingressosdisponiveis, valor, data) values (?, ?, ?, ?, ?, ?, now())", [v.idevento, v.idusuario, v.idtipo, v.idsetor, v.ingressosdisponiveis, v.valor]);

				v.id = await sql.scalar("select last_insert_id()");

				for (let i = v.ingressosdisponiveis - 1; i >= 0; i--)
					await sql.query("insert into ingresso (idevento, idpedido, idvenda, emailenviado, emailrecebido) values (?, 0, ?, 0, 0)", [v.idevento, v.id]);

				await app.fileSystem.saveUploadedFileToNewFile("public/imagens/ingresso/" + v.id + ".jpg", comprovante);

				await Evento.atualizarIngressosDisponiveis(sql, v.idevento);

				await sql.commit();
			} catch (e) {
				if (e.code) {
					switch (e.code) {
						case "ER_NO_REFERENCED_ROW":
						case "ER_NO_REFERENCED_ROW_2":
							return "Evento, usuário, tipo ou setor não encontrado";
					}
				}
				throw e;
			}
		});

		return erro;
    }

	public static async excluir(id: number, idusuario: number): Promise<string> {
		let erro: string = null;

		await app.sql.connect(async (sql: app.Sql) => {
			try {
				await sql.beginTransaction();

				await sql.query("delete from ingresso_venda where id = ? and idusuario = ?", [id, idusuario]);

				if (!sql.affectedRows)
					erro = "Venda não encontrada";
				else
					await app.fileSystem.deleteFile("public/imagens/ingresso/" + id + ".jpg");

				await sql.commit();
			} catch (e) {
				if (e.code) {
					switch (e.code) {
						case "ER_ROW_IS_REFERENCED":
						case "ER_ROW_IS_REFERENCED_2":
							return "A venda ainda possui um ou mais ingressos associados a ela";
					}
				}
				throw e;
			}
		});

		return erro;
	}

	public static async listarDeEvento(idevento: number): Promise<Venda[]> {
		let lista: Venda[] = null;

		await app.sql.connect(async (sql: app.Sql) => {
            lista = (await sql.query("select v.id, v.idtipo, t.nome tipo, v.idsetor, s.nome setor, v.valor, v.ingressosdisponiveis, date_format(v.data, '%d/%m/%Y') data from ingresso_venda v inner join ingresso_setor s on s.id = v.idsetor inner join ingresso_tipo t on t.id = v.idtipo where v.idevento = ? and v.ingressosdisponiveis > 0", [idevento])) as Venda[];
		});

		return lista || [];
    }

	public static async atualizarIngressosDisponiveis(sql: app.Sql, id: number): Promise<void> {
		await sql.query("update ingresso_venda set ingressosdisponiveis = (select count(*) from ingresso where idvenda = ? and idpedido = 0) where id = ?", [id, id]);
	}
};

export = Venda;
