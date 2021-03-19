import app = require("teem");
import Perfil = require("../../models/perfil");
import Usuario = require("../../models/usuario");
import jsonRes = require("../../utils/jsonRes");

class PerfilApiRoute {
	public async listar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res, true);
		if (!u)
			return;
		res.json(await Perfil.listar());
	}

	public async obter(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res, true);
		if (!u)
			return;
		let id = parseInt(req.query["id"] as string);
		res.json(isNaN(id) ? null : await Perfil.obter(id));
	}

	@app.http.post()
	public async criar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res, true);
		if (!u)
			return;
		let p = req.body as Perfil;
		jsonRes(res, 400, p ? await Perfil.criar(p) : "Dados inválidos");
	}

	@app.http.post()
	public async alterar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res, true);
		if (!u)
			return;
		let p = req.body as Perfil;
		if (p)
			p.id = parseInt(req.body.id);
		jsonRes(res, 400, (p && !isNaN(p.id)) ? await Perfil.alterar(p) : "Dados inválidos");
	}

	public async excluir(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res, true);
		if (!u)
			return;
		let id = parseInt(req.query["id"] as string);
		jsonRes(res, 400, isNaN(id) ? "Dados inválidos" : await Perfil.excluir(id));
	}
}

export = PerfilApiRoute;
