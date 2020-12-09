import express = require("express");
import wrap = require("express-async-error-wrapper");
import Usuario = require("../models/usuario");
import appsettings = require("../appsettings");

const router = express.Router();

router.all("/", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	res.render("safetix/index", { layout: "layout-safetix", usuario: u });
}));

router.all("/dashboard", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin)
		res.redirect(appsettings.root + "/login");
	else
		res.render("home/dashboard", { usuario: u });
}));

router.all("/login", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u) {
		let mensagem: string = null;

		if (req.body.login || req.body.senha) {
			[mensagem, u] = await Usuario.efetuarLogin(req.body.login as string, req.body.senha as string, res);
			if (mensagem) {
				res.render("safetix/login", { layout: "layout-safetix", usuario: null, mensagem: mensagem });
			} else {
				if (u.admin)
					res.redirect(appsettings.root + "/dashboard");
				else
					res.redirect(appsettings.root + "/");
			}
		} else {
			res.render("safetix/login", { layout: "layout-safetix", usuario: null, mensagem: null });
		}
	} else {
		res.redirect(appsettings.root + "/");
	}
}));

router.get("/acesso", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u)
		res.redirect(appsettings.root + "/login");
	else
		res.render("home/acesso", { titulo: "Sem Permissão", usuario: u });
}));

router.get("/perfil", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u || !u.admin)
		res.redirect(appsettings.root + "/");
	else
		res.render("home/perfil", { titulo: "Meu Perfil", usuario: u });
}));

router.get("/logout", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (u)
		await u.efetuarLogout(res);
	res.redirect(appsettings.root + "/");
}));

router.get("/alterarDados", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	res.render("safetix/alterarDados", { layout: "layout-safetix", usuario: u });
}));

router.get("/alterarIcone", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	res.render("safetix/alterarIcone", { layout: "layout-safetix", usuario: u });
}));

router.get("/cadastro", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	res.render("safetix/cadastro", { layout: "layout-safetix", usuario: u });
}));

router.get("/dadosBanca", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	res.render("safetix/dadosBanca", { layout: "layout-safetix", usuario: u });
}));

router.get("/perfilexterno", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	res.render("safetix/pagina-usuario", { layout: "layout-safetix", usuario: u });
}));

router.get("/pagamento", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	res.render("safetix/pagamento", { layout: "layout-safetix", usuario: u });
}));

router.get("/ingressos", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	res.render("safetix/ingressos", { layout: "layout-safetix", usuario: u });
}));

router.get("/carrinho", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	res.render("safetix/carrinho", { layout: "layout-safetix", usuario: u });
}));

router.get("/ajuda", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	res.render("safetix/ajuda", { layout: "layout-safetix", usuario: u });
}));

router.get("/quemsomos", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	res.render("safetix/quemsomos", { layout: "layout-safetix", usuario: u });
}));

router.get("/confirmacaopagamento", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	res.render("safetix/confirmacaopagamento", { layout: "layout-safetix", usuario: u });
}));

router.get("/ingressopublicado", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	res.render("safetix/ingressopublicado", { layout: "layout-safetix", usuario: u });
}));

export = router;
