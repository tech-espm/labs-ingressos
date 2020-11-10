import express = require("express");
import wrap = require("express-async-error-wrapper");
import jsonRes = require("../../utils/jsonRes");
import Notificacao = require("../../models/notificacao");

const router = express.Router();

router.get("/listarDeUsuario/:idusuariodestino", wrap(async (req: express.Request, res: express.Response) => {
    let erro: string = null;

    let id = parseInt(req.params["idusuariodestino"]);

    if(isNaN(id)){
        res.status(400).json("Id inválido");
    } else{
        res.json(await Notificacao.listarDeUsuario(id));
    }
}));

router.get("/marcarVista/:id", wrap(async (req: express.Request, res: express.Response) => {
    let erro: string = null;

    let id = parseInt(req.params["id"]);

    if(isNaN(id)){
        erro = "Id inválido";
    } else{
        erro = await Notificacao.marcarVista(id);
    }
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
        erro = await Notificacao.excluir(id);
    }
    if(erro){
        res.status(400).json(erro);
    }else{
        res.json(true);
    }
}));

export = router;
