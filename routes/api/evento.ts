import app = require("teem");
import Evento = require("../../models/evento");
import Usuario = require("../../models/usuario");
import jsonRes = require("../../utils/jsonRes");

class EventoApiRoute {
    public async listar(req: app.Request, res: app.Response) {
        let lista = await Evento.listar();

        res.json(lista);
    }

    public async listarBusca(req: app.Request, res: app.Response) {
        let lista = await Evento.listarBusca(req.query["nome"] as string, req.query["data"] as string);

        res.json(lista);
    }

    @app.route.methodName("/obter/:id")
    public async obter(req: app.Request, res: app.Response) {
        let erro: string = null;

        let id = parseInt(req.params["id"]);

        let evento: Evento = null;

        if (isNaN(id)) {
            erro = "Id inválido";
        } else {
            evento = await Evento.obter(id, true);

            if (!evento) {
                erro = "Evento não encontrado!";
            }
        }

        if (erro) {
            res.status(400).json(erro);
        } else {
            res.json(evento);
        }
    }

    @app.http.post()
    @app.route.formData()
    public async criar(req: app.Request, res: app.Response) {
        let erro: string = null;

        let evento = req.body as Evento;

        erro = await Evento.criar(evento, req.uploadedFiles.imagem);

        if(erro){
            res.status(400).json(erro);
        }else{
            res.json(true);
        }
    }

    @app.http.post()
    @app.route.formData()
    public async alterar(req: app.Request, res: app.Response) {
        let erro: string = null;

        let evento = req.body as Evento;

        erro = await Evento.alterar(evento, req.uploadedFiles.imagem);

        if(erro){
            res.status(400).json(erro);
        }else{
            res.json(true);
        }
    }

    @app.route.methodName("/excluir/:id")
    public async excluir(req: app.Request, res: app.Response) {
        let erro: string = null;

        let id = parseInt(req.params["id"]);

        if(isNaN(id)){
            erro = "Id inválido";
        } else{
            erro = await Evento.excluir(id);
        }
        if(erro){
            res.status(400).json(erro);
        }else{
            res.json(true);
        }
    }
}

export = EventoApiRoute;
