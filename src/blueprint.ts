import fs = require("fs");
import Entry from "./entry";
import { Operation } from "./operations";

export interface ConstructorOptions {
  /** The path to the blueprint directory. */
  source: string;

  /** The path to the destination directory that the blueprint will be
   * copied into. */
  destination: string;

  /** Object with strings that will be replaced in blueprint paths. */
  pathVariables?: Variables;
}

export interface Variables {
  [key: string]: string;
}

export default class Blueprint {
  source: string;
  destination: string;
  pathVariables: Variables;

  constructor(options: ConstructorOptions) {
    this.source = options.source;
    this.destination = options.destination;
    this.pathVariables = options.pathVariables;
  }

  get files() {
    return this.source + "/files";
  }

  operations(): Operation[] {
    // Get a sorted list of all files and directories in the blueprint.
    let entries = walk(this.files);

    let destination = this.destination;

    // Turn the list of source files into a list of operations, based on the
    // state of the target directory.
    return entries.map(entry => {
      return entry.toOperation(destination, this.pathVariables);
    }).filter(Boolean);
  }
};

function walk(baseDir: string, relativePath: string = "") {
  let dirPath = relativePath ? baseDir + "/" + relativePath : baseDir;
  let files = fs.readdirSync(dirPath);

  let entries = files.map(f => {
    let filePath = dirPath + "/" + f;
    let relativeFilePath = relativePath ? relativePath + "/" + f : f;
    let stats = fs.statSync(filePath);

    return new Entry(relativeFilePath, baseDir, stats.isDirectory());
  }).sort(({ path: a }, { path: b }) => {
    return ((a < b) ? -1 : ((a > b) ? 1 : 0));
  });

  let results: Entry[] = [];

  entries.forEach(entry => {
    if (entry.isDirectory) {
      results.push(entry);
      results = results.concat(walk(baseDir, entry.path));
    } else {
      results.push(entry);
    }
  });

  return results;
}