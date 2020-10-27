import Sql = require("../infra/sql");

export = class Pedido {
    public id: number;
    public idusuario: number;
    public idstatus: number;
    public data: string;
    public valortotal: number;
/*
 //N
    private static validar(p: pedido): string {
        p.nome = (p.nome || "").normalize().trim();
        if (p.nome.length < 3 || p.nome.length > 100)
            return "Nome inválido";
    
        return null;
    }
//S
    public static async listar(): Promise<pedido[]> {
		let lista: pedido[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select id, idusuario,idstatus, data, valortotal from pedido")) as pedido[];
		});

		return lista || [];
    }
//S/n
    public static async obter(id: number): Promise<pedido> {
		let lista: pedido[] = null;

		await Sql.conectar(async (sql: Sql) => {
			lista = (await sql.query("select id, idusuario,idstatus, data, valortotal from pedido where id = ?", [id])) as pedido[];
		});
		
		return (lista && lista[0]) || null;
	}
  //N
  public static async criar(p: pedido): Promise<string> {
    let res: string;
    if ((res = pedido.validar(p)))
        return res;

    await Sql.conectar(async (sql: Sql) => {
        try {
            await sql.query("insert into pedido (id, idusuario,idstatus, data, valortotal) values (?, ?, ?, ?, ?, ?, ?)" [p.id, p.idusuario,p.idstatus, p.data, p.valortotal]);
        } catch (e) {
        if (e.code && e.code === "ER_DUP_ENTRY") {
            res = `O assunto ${p.id} já existe`;
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
        await sql.query("delete from pedido where id = ?", [id]);
        res = sql.linhasAfetadas.toString();
    });

    return res;
} 
*/
}
