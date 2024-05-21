import LMC from "./libs/lmc-lib/LMC.js";

var memory = document.getElementById("memory");
for (var i = 0; i < 10; i++) {
    var row = memory.insertRow();
    for (var j = 0; j < 10; j++) {
        var cell = row.insertCell();
        cell.innerHTML = "000";
    }
}
var input = document.getElementById("input");
var output = document.getElementById("output");
var program_counter = document.getElementById("program_counter");
var accumulator = document.getElementById("accumulator");

var lmc = new LMC("");

function drawing() {
    var trs = (memory.children)[0].children;
    for (var i = 0; i < trs.length; i++) {
        var tds = trs[i].children;
        for (var j = 0; j < tds.length; j++) {
            tds[j].innerHTML = lmc.controller.memory[i * trs.length + j];
        }
    }
    input.value = lmc.controller.input;
    output.value = lmc.controller.output;
    program_counter.value = lmc.controller.program_counter;
    accumulator.value = lmc.controller.accumulator;
}

function compile() {
    var text = document.getElementById("inputArea").value;
    lmc = new LMC(text);
    document.getElementById("outputArea").value = lmc.compiler.intermediate_code;
    drawing();
}
document.querySelector("#compile").addEventListener('click', compile);

async function run() {
    while (await lmc.step() != "EXIT") {
        drawing();
    }
}
document.querySelector("#run").addEventListener('click', run);

async function step() {
    await lmc.step();
    drawing();
}
document.querySelector("#step").addEventListener('click', step);