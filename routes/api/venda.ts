import app = require("teem");
import Usuario = require("../../models/usuario");
import Venda = require("../../models/venda");

class VendaApiRoute {
    @app.http.post()
    @app.route.formData()
    public async criar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res);
        if (!u)
            return;

        let erro: string = null;

        let venda = req.body as Venda;
        venda.idusuario = u.id;

        erro = await Venda.criar(venda, req.uploadedFiles.comprovante);

        if (erro) {
            res.status(400).json(erro);
        } else {
            res.json(true);
        }
    }

    @app.route.methodName("/excluir/:id")
    public async excluir(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req, res);
        if (!u)
            return;

        let erro: string = null;

        let id = parseInt(req.params["id"]);

        if (isNaN(id)) {
            erro = "Id inválido";
        } else {
            erro = await Venda.excluir(id, u.id);
        }

        if (erro) {
            res.status(400).json(erro);
        } else {
            res.json(true);
        }
    }
}

export = VendaApiRoute;
