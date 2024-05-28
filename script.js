import LMC from './libs/lmc-lib/LMC.js';

var input = document.getElementById('input');
var output = document.getElementById('output');
var program_counter = document.getElementById('program_counter');
var accumulator = document.getElementById('accumulator');
var memory = document.getElementById('memory');
var lmc = new LMC('');

initTable();
drawing();

function initTable() {
  for (var i = 0; i < 10; i++) {
    var row = memory.insertRow();
    for (var j = 0; j < 10; j++) {
      row.insertCell();
    }
  }
}

function drawing() {
  var trs = (memory.children)[0].children;
  for (var i = 0; i < trs.length; i++) {
    var tds = trs[i].children;
    for (var j = 0; j < tds.length; j++) {
      tds[j].innerHTML = lmc.controller.memory[i * trs.length + j];
      var label = document.createElement('label');
      label.setAttribute('class', 'labelCell');
      label.innerHTML = 10 * i + j;
      tds[j].prepend(label);
    }
  }
  input.value = lmc.controller.input;
  output.value = lmc.controller.output;
  program_counter.value = lmc.controller.program_counter;
  accumulator.value = lmc.controller.accumulator;
}

function compile() {
  var text = document.getElementById('inputArea').value;
  lmc = new LMC(text);
  document.getElementById('outputArea').value = lmc.compiler.intermediate_code;
  clearBorder();
  drawing();
}
document.querySelector('#compile').addEventListener('click', compile);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  do {
    clearBorder();
    currentBorder(lmc.controller.program_counter);
    drawing();
    await sleep(1000);
  } while (await lmc.step() != 'EXIT')
}
document.querySelector('#run').addEventListener('click', run);

async function step() {
  clearBorder();
  currentBorder(lmc.controller.program_counter);
  await lmc.step();
  drawing();
}
document.querySelector('#step').addEventListener('click', step);

function clearBorder() {
  var border = '1px solid #ccc';
  var trs = (memory.children)[0].children;
  for (var i = 0; i < trs.length; i++) {
    var tds = trs[i].children;
    for (var j = 0; j < tds.length; j++) {
      tds[j].style.border = border;
    }
  }
}
function currentBorder(program_counter) {
  var trs = (memory.children)[0].children
  var tds = trs[parseInt(program_counter / 10)].children;
  tds[program_counter % 10].style.border = '1px solid green';
}