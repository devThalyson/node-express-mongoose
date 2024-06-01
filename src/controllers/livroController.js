import { livro, autor } from "../models/index.js";
import NaoEncontrado from "../errors/NaoEncontrado.js";

class LivroController {

  static async listarLivros(req, res, next) {
    try {
      const buscaLivros = livro.find();

      req.resultado = buscaLivros;

      next();
    } catch (erro) {
      next(erro);
    }
  };

  static async listarLivroPorId(req, res, next) {
    try {
      const id = req.params.id;
      const livroEncontrado = await livro.findById(id);

      if (livroEncontrado !== null) {
        res.status(200).json(livroEncontrado);
      } else {
        next(new NaoEncontrado("Id do livro não localizado."));
      }
    } catch (erro) {
      next(erro);
    }
  };

  static async cadastrarLivro(req, res, next) {
    const novoLivro = req.body;

    try {
      const autorEncontrado = await autor.findById(novoLivro.autor);
      const livroCompleto = { ...novoLivro, autor: { ...autorEncontrado._doc } };

      const livroCriado = await livro.create(livroCompleto);

      res.status(201).json({
        message: "Criado com sucesso",
        livro: livroCriado,
      });
    } catch (erro) {
      console.log(erro);
      next(erro);
    }
  };

  static async atualizarLivro(req, res, next) {
    try {
      const id = req.params.id;
      const livroAtualizado = await livro.findByIdAndUpdate(id, req.body);

      if (livroAtualizado !== null) {
        res.status(200).json({ message: "Livro atualizado" });
      } else {
        next(new NaoEncontrado("Id do livro não localizado."));
      }
    } catch (erro) {
      next(erro);
    }
  };

  static async deletarLivro(req, res, next) {
    try {
      const id = req.params.id;
      const livroDeletado = await livro.findByIdAndDelete(id);

      if (livroDeletado !== null) {
        res.status(200).json({ message: "Livro deletado" });
      } else {
        next(new NaoEncontrado("Id do livro não localizado."));
      }
    } catch (erro) {
      next(erro);
    }
  };

  static async listarLivrosPorFiltro(req, res, next) {
    try {
      const busca = await LivroController.processaBusca(req.query);

      if (busca !== null) {
        const livrosPorEditora = livro.find(busca);

        req.resultado = livrosPorEditora;

        next();
      } else {
        res.status(200).json([]);
      }
    } catch (erro) {
      next(erro);
    }
  };

  static async processaBusca(parametros) {
    const { editora, titulo, minPaginas, maxPaginas, nomeAutor } = parametros;

    let busca = {};

    if (editora) busca.editora = editora;
    if (titulo) busca.titulo = { $regex: titulo, $options: "i" };
    if (minPaginas || maxPaginas) busca.paginas = { ...(minPaginas && { $gte: minPaginas }), ...(maxPaginas && { $lte: maxPaginas }) };
    if (nomeAutor) {
      const autorResult = await autor.findOne({
        nome: nomeAutor,
      });

      if (autorResult !== null) {
        busca.autor = autorResult;
      } else {
        busca = null;
      }
    }

    return busca;
  };
};

export default LivroController;