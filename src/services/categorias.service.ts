import { categorias } from "../database/schemas/categorias.js";
import db from "../db.js";
import { isNull, isNotNull, eq } from "drizzle-orm";
import { AppError } from "../libs/appError.js";

export const getCategorias = async () => {
  const [categoriasAll, subcategoriasAll] = await Promise.all([
    db.select().from(categorias).where(isNull(categorias.idCategoriaPadre)),
    db.select().from(categorias).where(isNotNull(categorias.idCategoriaPadre)),
  ]);
  const submap = new Map<number, typeof subcategoriasAll>();
  subcategoriasAll.forEach((sub) => {
    const key = sub.idCategoriaPadre!;
    if (!submap.has(key)) {
      submap.set(key, []);
    }
    submap.get(key)!.push(sub);
  });
  const data = categoriasAll.map((cat) => ({
    ...cat,
    subcategorias: submap.get(cat.idCategoria) || [],
  }));
  return data;
};

export const getUnaCategoria = async (id: number) => {
  const [[categoria], subcategorias] = await Promise.all([
    db.select().from(categorias).where(eq(categorias.idCategoria, id)).limit(1),
    db.select().from(categorias).where(eq(categorias.idCategoriaPadre, id)),
  ]);
  if (!categoria) throw new AppError("No existe la categoria", 404);
  const categoriaCompleta = {
    categoria: categoria,
    subcategorias: subcategorias,
  };
  return categoriaCompleta;
};
