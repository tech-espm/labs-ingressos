import app = require("teem");
import Ingresso = require("../../models/ingresso");
import Usuario = require("../../models/usuario");
import jsonRes = require("../../utils/jsonRes");

class IngressoApiRoute {
    public async listar(req: app.Request, res: app.Response) {
        let lista = await Ingresso.listar();

        res.json(lista);
    }

    @app.route.methodName("/listarDeEvento/:idevento")
    public async listarDeEvento(req: app.Request, res: app.Response) {
        let lista = await Ingresso.listarDeEvento(parseInt(req.params["idevento"]));

        res.json(lista);
    }

    @app.http.post()
    public async criar(req: app.Request, res: app.Response) {
    
        let erro: string = null;

        let ingresso = req.body as Ingresso;

        erro = await Ingresso.criar(ingresso);

        if(erro){
            res.status(400).json(erro);
        }else{
            res.json(true);
        }
    }

    @app.http.post()
    public async alterar(req: app.Request, res: app.Response) {
        let erro: string = null;

        let ingresso = req.body as Ingresso;

        erro = await Ingresso.alterar(ingresso);

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
            erro = await Ingresso.excluir(id);
        }

        if (erro) {
            res.status(400).json(erro);
        } else {
            res.json(true);
        }
    }
}

export = IngressoApiRoute;
