import express = require("express");
import wrap = require("express-async-error-wrapper");
import Usuario = require("../models/usuario");
import appsettings = require("../appsettings");

const router = express.Router();

router.all("/", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u) {
		res.redirect(appsettings.root + "/login");
	} else {
		res.render("home/dashboard", { titulo: "Dashboard", usuario: u });
	}
}));

router.all("/login", wrap(async (req: express.Request, res: express.Response) => {
	let u = await Usuario.cookie(req);
	if (!u) {
		let mensagem: string = null;

		if (req.body.login || req.body.senha) {
			[mensagem, u] = await Usuario.efetuarLogin(req.body.login as string, req.body.senha as string, res);
			if (mensagem)
				res.render("home/login", { layout: "layout-externo", mensagem: mensagem });
			else
				res.redirect(appsettings.root + "/");
		} else {
			res.render("home/login", { layout: "layout-externo", mensagem: null });
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
	if (!u)
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

router.get("/alterarDados", (req: express.Request, res: express.Response) => {
	res.render("safetix/alterarDados", { layout: "layout-safetix" });
});

router.get("/alterarIcone", (req: express.Request, res: express.Response) => {
	res.render("safetix/alterarIcone", { layout: "layout-safetix" });
});

router.get("/cadastro", (req: express.Request, res: express.Response) => {
	res.render("safetix/cadastro", { layout: "layout-safetix" });
});

router.get("/dadosBanca", (req: express.Request, res: express.Response) => {
	res.render("safetix/dadosBanca", { layout: "layout-safetix" });
});

router.get("/pagina-usuario", (req: express.Request, res: express.Response) => {
	res.render("safetix/pagina-usuario", { layout: "layout-safetix" });
});

router.get("/telaPagamento", (req: express.Request, res: express.Response) => {
	res.render("safetix/telaPagamento", { layout: "layout-safetix" });
});

router.get("/index", (req: express.Request, res: express.Response) => {
	res.render("safetix/index", { layout: "layout-safetix" });
});

router.get("/ingressos", (req: express.Request, res: express.Response) => {
	res.render("safetix/ingressos", { layout: "layout-safetix" });
});

router.get("/carrinho", (req: express.Request, res: express.Response) => {
	res.render("safetix/carrinho", { layout: "layout-safetix" });
});

router.get("/telaAjuda", (req: express.Request, res: express.Response) => {
	res.render("safetix/telaAjuda", { layout: "layout-safetix" });
});

router.get("/quemsomos", (req: express.Request, res: express.Response) => {
	res.render("safetix/quemsomos", { layout: "layout-safetix" });
});

router.get("/confirmacaopagamento", (req: express.Request, res: express.Response) => {
	res.render("safetix/confirmacaopagamento", { layout: "layout-safetix" });
});

router.get("/ingressopublicado", (req: express.Request, res: express.Response) => {
	res.render("safetix/ingressopublicado", { layout: "layout-safetix" });
});

export = router;
