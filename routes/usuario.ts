import app = require("teem");
import Perfil = require("../models/perfil");
import Usuario = require("../models/usuario");

class UsuarioRoute {
	@app.http.all()
	public async criar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin)
			res.redirect(app.root + "/acesso");
		else
			res.render("usuario/alterar", { titulo: "Criar Usuário", usuario: u, item: null, perfis: await Perfil.listar() });
	}

	@app.http.all()
	public async alterar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin) {
			res.redirect(app.root + "/acesso");
		} else {
			let id = parseInt(req.query["id"] as string);
			let item: Usuario = null;
			if (isNaN(id) || !(item = await Usuario.obter(id)))
				res.render("home/nao-encontrado", { usuario: u });
			else
				res.render("usuario/alterar", { titulo: "Editar Usuário", usuario: u, item: item, perfis: await Perfil.listar() });
		}
	}

	public async listar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin)
			res.redirect(app.root + "/acesso");
		else
			res.render("usuario/listar", { titulo: "Gerenciar Usuários", usuario: u, lista: JSON.stringify(await Usuario.listar()) });
	}
}

export = UsuarioRoute;
