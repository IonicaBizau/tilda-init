"use strict";

const isThere = require("is-there")
    , ul = require("ul")
    , path = require("path")
    , abs = require("abs")
    , rJson = require("r-package-json")
    , wJson = require("w-package-json")
    , oneByOne = require("one-by-one")
    , writeFile = require("write-file-p")
    , camelo = require("camelo")
    , npm = require("spawn-npm")
    ;


/**
 * tildaInit
 * Init the cli interface.
 *
 * @name tildaInit
 * @function
 * @param {String} dir The dir path.
 * @param {Object} opts An object containing:
 *
 *  - `path` (String): The test script name (default: `bin/{name}`)
 *
 * @param {Function} cb The callback function.
 */
module.exports = function testerInit (dir, opts, cb) {

    if (typeof opts === "function") {
        cb = opts;
        opts = {};
    }

    opts = ul.merge({
        path: `bin/${pack.name}`
    });

    dir = path.normalize(abs(dir));

    let indexPath = path.join(dir, opts.path);

    oneByOne([
        next => rJson(dir, next)
      , (next, pack) => {
            if (pack.bin && typeof pack.bin === "string") {
                pack.bin = { [pack.name]: pack.bin };
            }
            pack = ul.merge(pack, {
                bin: {}
            });
            pack.bin[pack.name] = `bin/${pack.name}`;
            wJson(dir, pack, err => next(err, pack));
        }
      , (next, pack) => isThere(indexPath, exists => next(exists && new Error("The executable file already exists. Refusing to override it."), pack))
      , (next, pack) => {
            let cName = camelo(pack.name);
            writeFile(indexPath, `"use strict";

const Tilda = require("tilda")
    , ${cName} = require("..")
    ;

new Tilda(\`$\{__dirname\}/../package.json\`, {
    options: [
        {
            name: "foo"
          , opts: ["f", "foo"]
          , desc: "Dummy argument"
        }
    ]
}).main(action => {
    /* Do something there */
});`, next);
        }
      , next => {
            npm("install", {
                "save": true
              , _: ["tilda"]
            }, { cwd: dir, _showOutput: true }, next);
        }
    ], cb);
};
