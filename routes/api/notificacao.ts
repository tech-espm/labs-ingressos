import app = require("teem");
import Notificacao = require("../../models/notificacao");
import Usuario = require("../../models/usuario");
import jsonRes = require("../../utils/jsonRes");

class NotificacaoApiRoute {
    @app.route.methodName("/listarDeUsuario/:idusuariodestino")
    public async listarDeUsuario(req: app.Request, res: app.Response) {
        let erro: string = null;

        let id = parseInt(req.params["idusuariodestino"]);

        if (isNaN(id)) {
            res.status(400).json("Id inválido");
        } else {
            res.json(await Notificacao.listarDeUsuario(id));
        }
    }

    @app.route.methodName("/marcarVista/:id")
    public async marcarVista(req: app.Request, res: app.Response) {
        let erro: string = null;

        let id = parseInt(req.params["id"]);

        if (isNaN(id)) {
            erro = "Id inválido";
        } else {
            erro = await Notificacao.marcarVista(id);
        }

        if (erro) {
            res.status(400).json(erro);
        } else {
            res.json(true);
        }
    }

    @app.route.methodName("/excluir/:id")
    public async excluir(req: app.Request, res: app.Response) {
        let erro: string = null;

        let id = parseInt(req.params["id"]);

        if (isNaN(id)) {
            erro = "Id inválido";
        } else {
            erro = await Notificacao.excluir(id);
        }

        if (erro) {
            res.status(400).json(erro);
        } else {
            res.json(true);
        }
    }
}

export = NotificacaoApiRoute;
