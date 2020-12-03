import { createConnection, getConnection } from "typeorm";
import { Categories } from "./entities/Categories";
import { Jokes } from "./entities/Jokes";
import path from "path";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";

const main = async () => {
  const connection = await createConnection({
    type: "sqlite",
    database: "../jokesdb.sql",
    entities: [Jokes, Categories],
    synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    logging: true,
  });
  await connection.runMigrations();

  const app = express();
  app.use(bodyParser.json());

  app.get("/jokes/random", async (_: Request, res: Response) => {
    const jokes = await Jokes.find({});
    const random = Math.floor(Math.random() * jokes.length);
    res.send(jokes[random]);
  });
  app.get(
    "/categories/:categoryId/jokes/random",
    async (req: Request, res: Response) => {
      const qb = getConnection()
        .getRepository(Categories)
        .createQueryBuilder("c")
        .where("c.id = :id", { id: parseInt(req.params.categoryId) })
        .innerJoinAndSelect("c.jokes", "jokes", 'jokes."categoryId" = c.id');
      const category = await qb.getOne();
      if (!category) {
        return res.status(404).send({ error: "category is not existed" });
      }
      const random = Math.floor(Math.random() * category.jokes.length);
      return res.send(category.jokes[random]);
    }
  );
  app.get("/categories", async (_: Request, res: Response) => {
    const qb = getConnection()
      .getRepository(Categories)
      .createQueryBuilder("c")
      .innerJoinAndSelect("c.jokes", "jokes", 'jokes."categoryId" = c.id');
    const categories = await qb.getMany();
    res.send(categories);
  });
  app.get(
    "/categories/:categoryId/jokes",
    async (req: Request, res: Response) => {
      const qb = getConnection()
        .getRepository(Categories)
        .createQueryBuilder("c")
        .where("c.id = :id", { id: parseInt(req.params.id) })
        .innerJoinAndSelect("c.jokes", "jokes", 'jokes."categoryId" = c.id');
      const category = await qb.getOne();
      if (!category) {
        return res.status(404).send({ error: "category is not existed" });
      }
      return res.send(category.jokes);
    }
  );
  app.get("/jokes/:jokeId", async (req: Request, res: Response) => {
    const joke = await Jokes.findOne({
      id: parseInt(req.params!.jokeId),
    });
    if (!joke) {
      return res.status(404).send({ error: "joke is not exist" });
    }
    return res.send(joke);
  });
  app.post("/categories", async (req: Request, res: Response) => {
    const { name } = req.body;
    const newCategory = await Categories.create({ name }).save();
    res.send(newCategory);
  });
  app.post("/jokes", async (req: Request, res: Response) => {
    const { content, categoryName } = req.body;
    const category = await Categories.findOne({ name: categoryName });
    if (!category) {
      return res.status(404).send({ error: "Category is not found" });
    }
    const newJoke = await Jokes.create({
      content,
      categoryId: category.id,
    }).save();
    return res.send(newJoke);
  });
  app.put("/jokes/:jokeId/like", async (req: Request, res: Response) => {
    const joke = await Jokes.findOne({
      id: parseInt(req.params!.jokeId),
    });
    if (!joke) {
      return res.status(404).send({ error: "joke is not exist" });
    }
    joke.likes++;
    await joke.save();
    return res.send(true);
  });
  app.put("/jokes/:jokeId/dislike", async (req: Request, res: Response) => {
    const joke = await Jokes.findOne({
      id: parseInt(req.params!.jokeId),
    });
    if (!joke) {
      return res.status(404).send({ error: "joke is not exist" });
    }
    joke.dislikes++;
    await joke.save();
    return res.send(true);
  });
  app.listen(5000, () => {
    console.log("listening on: 5000");
  });
};

main();
