import app = require("teem");
import appsettings = require("./appsettings");

app.run({
	root: appsettings.root,
	staticRoot: "",
	sqlConfig: appsettings.sqlPool,
	htmlErrorHandler: function (err: any, req: app.Request, res: app.Response, next: app.NextFunction) {
		res.status(err.status || 500);

		if (req.path.indexOf("/api/") >= 0) {
			res.json(err.status == 404 ? "Não encontrado" : (err.message || err.toString()));
		} else if (err.status == 404) {
			res.render("shared/erro", { layout: "layout-externo" });
		} else {
			// Como é um ambiente de desenvolvimento, deixa o objeto do erro
			// ir para a página, que possivelmente exibirá suas informações
			res.render("shared/erro", { layout: "layout-externo", mensagem: err.message, erro: err });
		}
    }
});
