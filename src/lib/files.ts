import { glob } from "glob";

export const LoadFiles = async (dir: string): Promise<string[]> => {
  const isDev = __filename.endsWith(".ts");
  const fullPath = `${process.cwd().replaceAll("\\", "/")}/${
    isDev ? "src" : "dist"
  }/${dir}`;
  const files = await glob(`${fullPath}/**/*.${isDev ? "ts" : "js"}`);
  files.forEach((file) => delete require.cache[require.resolve(file)]);
  return files;
};
