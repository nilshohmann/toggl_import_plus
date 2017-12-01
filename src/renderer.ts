// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

import "reflect-metadata";
import "./utils/array.extension";
import "./utils/date.extension";
import "./utils/string.extension";

import $ = require("jquery");
import { Container, Inject, Service } from "typedi";
import Views = require("./views/views");

import { RootViewModel } from "./views/root";

$(() => {
    const root = Container.get(RootViewModel);

    Views.render(root, $(document.body));
});
