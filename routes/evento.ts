import app = require("teem");
import Evento = require("../models/evento");
import Usuario = require("../models/usuario");

class EventoRoute {
	@app.http.all()
	public async criar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin)
			res.redirect(app.root + "/acesso");
		else
			res.render("evento/alterar", { titulo: "Criar Evento", usuario: u, item: null });
	}

	@app.http.all()
	public async alterar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin) {
			res.redirect(app.root + "/acesso");
		} else {
			let id = parseInt(req.query["id"] as string);
			let item: Evento = null;
			if (isNaN(id) || !(item = await Evento.obter(id)))
				res.render("home/nao-encontrado", { usuario: u });
			else
				res.render("evento/alterar", { titulo: "Editar Evento", usuario: u, item: item });
		}
	}

	public async listar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin)
			res.redirect(app.root + "/acesso");
		else
			res.render("evento/listar", { titulo: "Gerenciar Eventos", usuario: u, lista: JSON.stringify(await Evento.listar()) });
	}
}

export = EventoRoute;
