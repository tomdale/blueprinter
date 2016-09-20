import { Variables } from "./blueprint";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import template = require("lodash.template");

export interface Operation {
  execute(): void;
}

export class CreateFile implements Operation {
  constructor(public srcPath: string, public destPath: string, public fileVariables?: Variables) {
  }

  execute(){
    let source = readFileSync(this.srcPath);
    let compiled = template(source);

    writeFileSync(this.destPath, compiled(this.fileVariables));
  }
}

export class CreateDirectory implements Operation {
  constructor(public destPath: string) {
  }

  execute() {
    mkdirSync(this.destPath);
  }
}