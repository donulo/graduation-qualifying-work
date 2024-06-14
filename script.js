import LMC from './libs/lmc-lib/LMC.js';

let input = document.getElementById('input');
let output = document.getElementById('output');
let program_counter = document.getElementById('program_counter');
let accumulator = document.getElementById('accumulator');
let memory = document.getElementById('memory');
let lmc = new LMC('');

initTable();
drawing();

function initTable() {
  for (let i = 0; i < 10; i++) {
    let row = memory.insertRow();
    for (let j = 0; j < 10; j++) {
      row.insertCell();
    }
  }
}

function drawing() {
  let trs = (memory.children)[0].children;
  for (let i = 0; i < trs.length; i++) {
    let tds = trs[i].children;
    for (let j = 0; j < tds.length; j++) {
      tds[j].innerHTML = lmc.controller.memory[i * trs.length + j];
      let label = document.createElement('label');
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
  let text = document.getElementById('inputArea').value;
  lmc = new LMC(text);
  if (lmc.compiler.error == undefined)
    document.getElementById('outputArea').value =
        lmc.compiler.intermediate_code;
  else {
    document.getElementById('outputArea').value =
        'Error: ' + lmc.compiler.error.code;
    document.getElementById('outputArea').value +=
        '\nLine: ' + lmc.compiler.error.line;
    highlightLine(
        'inputArea', 'highlightInputArea', lmc.compiler.error.line, 'red');
  }
  clearBorder();
  drawing();
  coloredSegment(
      lmc.compiler.segments.code.CB, lmc.compiler.segments.code.CL,
      'rgba(0, 255, 0, 0.3)');
  coloredSegment(
      lmc.compiler.segments.data.DB, lmc.compiler.segments.data.DL,
      'rgba(155, 0, 0, 0.3)');
  console.log(lmc);
}
document.querySelector('#compile').addEventListener('click', compile);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  let state;
  do {
    state = await step();
    await sleep(100);
  } while (state != 'EXIT')
}
document.querySelector('#run').addEventListener('click', run);

async function step() {
  highlightLine(
      'inputArea', 'highlightInputArea', lmc.controller.program_counter,
      'green');
  highlightLine(
      'outputArea', 'highlightOutputArea', lmc.controller.program_counter,
      'green');
  clearBorder();
  currentBorder(lmc.controller.program_counter);
  let state = await lmc.step();
  drawing();
  if (state == 'NOEXEC' || state == 'NOSTORE') {
    alert('Error: segmentation fault\nLine: ' + lmc.controller.program_counter);
    return 'EXIT';
  }
  return state;
}
document.querySelector('#step').addEventListener('click', step);

function reset() {
  lmc = new LMC('');
  document.getElementById('outputArea').value = '';
  resetHighlight('highlightInputArea');
  resetHighlight('highlightOutputArea');
  clearBorder();
  drawing();
}
document.querySelector('#reset').addEventListener('click', reset);

function clearBorder() {
  let border = '1px solid #ccc';
  let trs = (memory.children)[0].children;
  for (let i = 0; i < trs.length; i++) {
    let tds = trs[i].children;
    for (let j = 0; j < tds.length; j++) {
      tds[j].style.border = border;
    }
  }
}

function currentBorder(program_counter) {
  let trs = (memory.children)[0].children
  let tds = trs[parseInt(program_counter / 10)].children;
  tds[program_counter % 10].style.border = '1px solid rgba(0, 255, 0, 1)';
}

function highlightLine(textareaId, highlightId, lineNumber, color) {
  const textarea = document.getElementById(textareaId);
  const highlight = document.getElementById(highlightId);
  const lines = textarea.value.split('\n');

  let highlightedContent = '';
  lines.forEach((line, index) => {
    if (index === lineNumber) {
      highlightedContent +=
          `<span class="highlight ${color}">${line || ' '}</span>\n`;
    } else {
      highlightedContent += `${line}\n`;
    }
  });

  highlight.innerHTML = highlightedContent;
}

function resetHighlight(highlightId) {
  const highlight = document.getElementById(highlightId);
  let text = highlight.innerHTML;
  text = text.replace(/<span class="highlight.*">/, '');
  text = text.replace('</span>', '');
  highlight.innerHTML = text;
}

function coloredSegment(ib, il, color) {
  let i = parseInt(ib / 10);
  let j = ib % 10;
  let count = 0;
  let trs = (memory.children)[0].children;
  for (; count != il + 1 && i < trs.length; i++) {
    let tds = trs[i].children;
    for (; count != il + 1 && j < tds.length; j++) {
      coloredBackground(tds[j], color);
      count++;
    }
    if (j == tds.length) j = 0;
  }
}

function coloredBackground(element, color) {
  element.style.background = color;
}