import express = require("express");
import wrap = require("express-async-error-wrapper");
import jsonRes = require("../../utils/jsonRes");
import Ingresso = require("../../models/ingresso");

const router = express.Router();

router.get("/listar", wrap(async (req: express.Request, res: express.Response) => {
    let lista = await Ingresso.listar();

    res.json(lista);
}));

router.get("/listarDeEvento/:idevento", wrap(async (req: express.Request, res: express.Response) => {
    let lista = await Ingresso.listarDeEvento(parseInt(req.params["idevento"]));

    res.json(lista);
}));

router.post("/criar", wrap(async (req: express.Request, res: express.Response) => {
    let erro: string = null;

    let ingresso = req.body as Ingresso;

    erro = await Ingresso.criar(ingresso);

    if(erro){
        res.status(400).json(erro);
    }else{
        res.json(true);
    }

}));

router.post("/alterar", wrap(async (req: express.Request, res: express.Response) => {
    let erro: string = null;

    let ingresso = req.body as Ingresso;

    erro = await Ingresso.alterar(ingresso);

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
        erro = await Ingresso.excluir(id);
    }
    if(erro){
        res.status(400).json(erro);
    }else{
        res.json(true);
    }
}));

export = router;
