import Sql = require("../infra/sql");

export = class Pedido {
    public id: number;
    public idusuario: number;
    public idstatus: number;
    public data: string;
    public valortotal: number;

	private static validar(p: Pedido): string {
		if (!p)
			return "Pedido inválido";

		p.idusuario = parseInt(p.idusuario as any);
		if (isNaN(p.idusuario))
			return "Usuário inválido";

		return null;
	}

	public static async listarDeUsuario(idusuario: number): Promise<Pedido[]> {
		let lista: Pedido[] = null;

		await Sql.conectar(async (sql: Sql) => {
            lista = (await sql.query("select idusuario, idstatus, date_format(data, '%d/%m/%Y %H:%i') data, valortotal from pedido where idusuario = ?", [idusuario])) as Pedido[];
		});

		return lista || [];
    }

	public static async criar(p: Pedido): Promise<string> {
		let erro: string;
		if ((erro = Pedido.validar(p)))
            return erro;

		await Sql.conectar(async (sql: Sql) => {
            await sql.query("insert into pedido (idusuario, idstatus, data, valortotal) values (?, 0, now(), 0)", [p.idusuario]);

            p.id = await sql.scalar("select last_insert_id()");
		});

		return erro;
    }

	public static async adicionarIngresso(idpedido: number, idingresso: number): Promise<string> {
        let erro: string = null;

        await Sql.conectar(async (sql: Sql) => {
            await sql.beginTransaction();

            const id = await sql.scalar("select id from pedido where id = ?", [idpedido]);
            if (!id) {
                erro = "Pedido não encontrado";
                return;
            }

            await sql.query("update ingresso set idpedido = ? where id = ? and idpedido = 0", [idpedido, idingresso]);
            if (!sql.linhasAfetadas) {
                erro = "Ingresso não disponível";
                return;
            }

            await sql.query("update pedido set valortotal = (select sum(i.valor) from ingresso i where i.idpedido = ?) where id = ?", [idpedido, idpedido]);

            await sql.commit();
		});

		return erro;
    }

	public static async removerIngresso(idpedido: number, idingresso: number): Promise<string> {
        let erro: string = null;

        await Sql.conectar(async (sql: Sql) => {
            await sql.beginTransaction();

            const id = await sql.scalar("select id from pedido where id = ?", [idpedido]);
            if (!id) {
                erro = "Pedido não encontrado";
                return;
            }

            await sql.query("update ingresso set idpedido = 0 where id = ? and idpedido = ?", [idingresso, idpedido]);
            if (!sql.linhasAfetadas) {
                erro = "Ingresso não encontrado";
                return;
            }

            await sql.query("update pedido set valortotal = (select sum(i.valor) from ingresso i where i.idpedido = ?) where id = ?", [idpedido, idpedido]);

            await sql.commit();
		});

		return erro;
    }

	public static async excluir(id: number): Promise<string> {
		let erro: string = null;

		await Sql.conectar(async (sql: Sql) => {
            await sql.beginTransaction();

            await sql.query("delete from pedido where id = ?", [id]);

            if (!sql.linhasAfetadas) {
                erro = "Pedido não encontrado";
                return;
            }

            await sql.query("update ingresso set idpedido = 0 where idpedido = ?", [id]);

            await sql.commit();
		});

		return erro;
	}
};
