import express = require("express");
import wrap = require("express-async-error-wrapper");
import jsonRes = require("../../utils/jsonRes");
import Evento = require("../../models/evento");

const router = express.Router();

router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
    let lista = await Evento.listar();

    res.json(lista);
}));

router.get("/listarBusca", wrap(async (req: express.Request, res: express.Response) => {
    let lista = await Evento.listarBusca(req.query["nome"] as string, req.query["data"] as string);

    res.json(lista);
}));

router.get("/obter/:id", wrap(async (req: express.Request, res: express.Response) => {
    let erro: string = null;

    let id = parseInt(req.params["id"]);

    let evento: Evento = null;

    if (isNaN(id)) {
        erro = "Id inválido";
    } else {
        evento = await Evento.obter(id);

        if (!evento) {
            erro = "Evento não encontrado!";
        }
    }

    if (erro) {
        res.status(400).json(erro);
    } else {
        res.json(evento);
    }

}));

router.post("/criar", wrap(async (req: express.Request, res: express.Response) => {
    let erro: string = null;

    let evento = req.body as Evento;

    erro = await Evento.criar(evento);

    if(erro){
        res.status(400).json(erro);
    }else{
        res.json(true);
    }

}));

router.post("/alterar", wrap(async (req: express.Request, res: express.Response) => {
    let erro: string = null;

    let evento = req.body as Evento;

    erro = await Evento.alterar(evento);

    if(erro){
        res.status(400).json(erro);
    }else{
        res.json(true);
    }

}));

router.get("/excluir/:id", wrap(async (req: express.Request, res: express.Response) => {
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
}));

export = router;
