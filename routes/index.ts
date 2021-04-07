import app = require("teem");
import Usuario = require("../models/usuario");
import Evento = require("../models/evento");

class IndexRoute {
	public async index(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		res.render("safetix/index", {
			layout: "layout-safetix",
			eventos: await Evento.listar(),
			usuario: u
		});
	}

	@app.http.all()
	public async dashboard(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin)
			res.redirect(app.root + "/login");
		else
			res.render("home/dashboard", { usuario: u });
	}

	@app.http.all()
	public async login(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u) {
			let mensagem: string = null;
	
			if (req.body.login || req.body.senha) {
				[mensagem, u] = await Usuario.efetuarLogin(req.body.login as string, req.body.senha as string, res);
				if (mensagem) {
					res.render("safetix/login", { layout: "layout-safetix", usuario: null, mensagem: mensagem });
				} else {
					if (u.admin)
						res.redirect(app.root + "/dashboard");
					else
						res.redirect(app.root + "/");
				}
			} else {
				res.render("safetix/login", { layout: "layout-safetix", usuario: null, mensagem: null });
			}
		} else {
			res.redirect(app.root + "/");
		}
	}
	
	public async acesso(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/login");
		else
			res.render("home/acesso", { titulo: "Sem Permissão", usuario: u });
	}
	
	public async perfil(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin)
			res.redirect(app.root + "/");
		else
			res.render("home/perfil", { titulo: "Meu Perfil", usuario: u });
	}
	
	public async logout(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (u)
			await u.efetuarLogout(res);
		res.redirect(app.root + "/");
	}
	
	public async alterarDados(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		res.render("safetix/alterarDados", { layout: "layout-safetix", usuario: u });
	}
	
	public async alterarIcone(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		res.render("safetix/alterarIcone", { layout: "layout-safetix", usuario: u });
	}
	
	public async cadastro(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		res.render("safetix/cadastro", { layout: "layout-safetix", usuario: u });
	}

	@app.route.methodName("dadosBanca/:id")
	public async dadosBanca(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);

		if (!u) {
			res.redirect(app.root + "/login");
			return;
		}

		let evento = await Evento.obter(parseInt(req.params["id"]), false);

		if (!evento) {
			res.render("shared/erro", {
				layout: "layout-externo",
				mensagem: "Evento não encontrado"
			});
			return;
		}

		res.render("safetix/dadosBanca", {
			layout: "layout-safetix",
			evento: evento,
			usuario: u
		});
	}

	public async perfilexterno(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		res.render("safetix/pagina-usuario", { layout: "layout-safetix", usuario: u });
	}

	public async pagamento(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		res.render("safetix/pagamento", { layout: "layout-safetix", usuario: u });
	}

	@app.route.methodName("ingressos/:id")
	public async ingressos(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);

		if (!u) {
			res.redirect(app.root + "/login");
			return;
		}

		let evento = await Evento.obter(parseInt(req.params["id"]), false);

		if (!evento) {
			res.render("shared/erro", {
				layout: "layout-externo",
				mensagem: "Evento não encontrado"
			});
			return;
		}

		res.render("safetix/ingressos", {
			layout: "layout-safetix",
			evento: evento,
			usuario: u
		});
	}

	public async carrinho(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		res.render("safetix/carrinho", { layout: "layout-safetix", usuario: u });
	}

	public async ajuda(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		res.render("safetix/ajuda", { layout: "layout-safetix", usuario: u });
	}

	public async quemsomos(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		res.render("safetix/quemsomos", { layout: "layout-safetix", usuario: u });
	}

	public async confirmacaopagamento(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		res.render("safetix/confirmacaopagamento", { layout: "layout-safetix", usuario: u });
	}

	public async ingressopublicado(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		res.render("safetix/ingressopublicado", { layout: "layout-safetix", usuario: u });
	}
}

export = IndexRoute;
