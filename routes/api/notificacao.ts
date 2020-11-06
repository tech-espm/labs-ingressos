import express = require("express");
import wrap = require("express-async-error-wrapper");
import jsonRes = require("../../utils/jsonRes");
import Notificacao = require("../../models/notificacao");

const router = express.Router();

router.post("/criar", wrap(async (req: express.Request, res: express.Response) => {
    let erro: string = null;

    let notificacao = req.body as Notificacao;

    erro = await Notificacao.criar(notificacao);

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