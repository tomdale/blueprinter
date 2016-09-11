import * as Op from "./operations";
import { Variables } from "./blueprint";
import { existsSync } from "fs";

export interface OperationOptions {
}

export default class Entry {
  constructor(public path: string,
              public srcDir: string,
              public isDirectory: boolean) { }

  get srcPath() {
    return `${this.srcDir}/${this.path}`;
  }

  toOperation(destDir: string, pathVariables: Variables, fileVariables: Variables): Op.Operation {
    let destPath = `${destDir}/${this.path}`;
    destPath = interpolateVariables(destPath, pathVariables);

    if (existsSync(destPath)) {
      return null;
    }

    if (this.isDirectory) {
      return new Op.CreateDirectory(destPath);
    } else {
      return new Op.CreateFile(this.srcDir + "/" + this.path, destPath, fileVariables);
    }
  }
}

function interpolateVariables(path: string, variables: Variables): string {
  if (!variables) { return path; }

  let result = path;

  Object.keys(variables).forEach(key => {
    // This allows us to replace all instances of the search string without
    // having to use new RegExp(search, 'g'), which would require us to escape
    // the search string.
    result = result.split(key).join(variables[key]);
  });

  return result;
}