import { openDatabase } from "../../src/storage/db.js";
import { ArticlesRepo } from "../../src/storage/articlesRepo.js";

export function createTestRepo(): ArticlesRepo {
  const db = openDatabase(":memory:");
  return new ArticlesRepo(db);
}
