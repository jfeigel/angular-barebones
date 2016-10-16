/*jshint node:true*/
"use strict";

const Koa = require("koa");
const app = new Koa();

const serve = require("koa-static-folder");
const bodyParser = require("koa-bodyparser");

const port = process.env.PORT || 8001;
const environment = process.env.NODE_ENV;

app.use(bodyParser());

app.use(function* appUse(next) {
	try {
		yield next;
	} catch (err) {
		if (this.state.api === true) {
			// if this was an API request, send the error back in a plain response
			this.app.emit("error", err, this);
			this.body = {error: true, message: String(err)};
		} else {
			// this wasn"t an API request, show the error page
			this.app.emit("error", err, this);
			yield this.render("error", {
				dump: err
			});
		}
	}
});

console.log(`PORT=${port}`);
console.log(`NODE_ENV=${environment}`);

switch (environment) {
  case "production":
    break;
  default:
    console.log("** DEV **");
    app.use(serve("./src/client/"));
    app.use(serve("./"));
    // app.use("/docs", serve("./src/client/docs/"));
    // Any deep link calls should return index.html
    // app.use("/*", serve("./src/client/index.html"));
    break;
}

app.listen(port, function() {
  console.log(`Express server listening on port ${port}`);
  console.log(`env = ${app.env}` +
    `\n__dirname = ${__dirname}` +
    `\nprocess.cwd = ${process.cwd()}`);
});
