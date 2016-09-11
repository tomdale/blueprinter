import { expect } from "chai";
import temp = require("temp");
import fsp = require("fs-extra-promise");

temp.track();

import Blueprint from "../src/blueprint";
import * as Op from "../src/operations";

describe("Blueprint", function() {
  let tmpdir: string;

  beforeEach(function() {
    tmpdir = temp.mkdirSync("blueprinter");
  });

  describe("basic case", function() {
    let fixturePath = fixture("basic");
    let filesPath = fixturePath + "/files";

    it("creates new files", function() {
      let blueprint = new Blueprint({
        source: fixturePath,
        destination: tmpdir
      });

      let operations = blueprint.operations();

      expect(operations).to.deep.equal([
        new Op.CreateDirectory(tmpdir + "/app"),
        new Op.CreateDirectory(tmpdir + "/app/controllers"),
        new Op.CreateFile(filesPath + "/app/controllers/controller.js", tmpdir + "/app/controllers/controller.js"),
        new Op.CreateFile(filesPath + "/app.js", tmpdir + "/app.js"),
      ]);
    });

    it("skips existing directories", function() {
      tmpdir = tmpdir + "/existing-basic";
      fsp.copySync(fixture("existing-basic"), tmpdir);

      let blueprint = new Blueprint({
        source: fixturePath,
        destination: tmpdir
      });

      let operations = blueprint.operations();

      expect(operations).to.deep.equal([
        new Op.CreateDirectory(tmpdir + "/app/controllers"),
        new Op.CreateFile(filesPath + "/app/controllers/controller.js", tmpdir + "/app/controllers/controller.js"),
      ]);
    });

  });

  describe("path variables", function() {
    let fixturePath = fixture("path-variables");
    let filesPath = fixturePath + "/files";

    it("replaces path variables with provided value", function() {
      tmpdir = tmpdir + "/existing-path-variables";
      fsp.copySync(fixture("existing-path-variables"), tmpdir);

      let blueprint = new Blueprint({
        source: fixturePath,
        destination: tmpdir,
        pathVariables: {
          __name__: "existing",
          __type__: "controller"
        }
      });

      let operations = blueprint.operations();

      expect(operations).to.deep.equal([
        new Op.CreateFile(filesPath + "/__name__-b.js", tmpdir + "/existing-b.js"),
        new Op.CreateDirectory(tmpdir + "/dir-a-existing"),
        new Op.CreateFile(filesPath + "/dir-a-__name__/__name__", tmpdir + "/dir-a-existing/existing"),
        new Op.CreateFile(filesPath + "/dir-a-__name__/__name____name____name__", tmpdir + "/dir-a-existing/existingexistingexisting"),
        new Op.CreateFile(filesPath + "/dir-a-__name__/__type__-__name__", tmpdir + "/dir-a-existing/controller-existing"),
      ]);
    });

  });

  describe("file variables", function() {
    let fixturePath = fixture("file-variables");
    let filesPath = fixturePath + "/files";

    it("replaces file variables with provided values", function() {
      tmpdir = tmpdir + "/existing-file-variables";
      fsp.copySync(fixture("existing-file-variables"), tmpdir);

      let blueprint = new Blueprint({
        source: fixturePath,
        destination: tmpdir,
        fileVariables: {
          name: "AppName"
        }
      });

      blueprint.install();

      let contents = fsp.readFileSync(tmpdir + "/index.js");
      expect(contents.toString()).to.equal(`let app = "AppName";`);
    });

  });
});

function fixture(name: string) {
  return __dirname + "/fixtures/" + name;
}