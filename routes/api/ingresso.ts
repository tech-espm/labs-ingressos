import app = require("teem");
import Ingresso = require("../../models/ingresso");
import Usuario = require("../../models/usuario");

class IngressoApiRoute {
    @app.route.methodName("/listarDeEvento/:idevento")
    public async listarDeEvento(req: app.Request, res: app.Response) {
    
        let lista = await Ingresso.listarDeEvento(parseInt(req.params["idevento"]));

        res.json(lista);
        res.sendStatus(204);
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
            erro = await Ingresso.excluir(id, u.id);
        }

        if (erro) {
            res.status(400).json(erro);
        } else {
            res.json(true);
        }
    }
}

export = IngressoApiRoute;
