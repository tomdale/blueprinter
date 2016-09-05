import { copySync, mkdirSync } from "fs-extra-promise";

export interface Operation {
  execute(): void;
}

export class CreateFile implements Operation {
  constructor(public srcPath: string, public destPath: string) {
  }

  execute() {
    copySync(this.srcPath, this.destPath);
  }
}

export class CreateDirectory implements Operation {
  constructor(public destPath: string) {
  }

  execute() {
    mkdirSync(this.destPath);
  }
}