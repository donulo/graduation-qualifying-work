import Validator from './Validator.js';
import {instructions} from './Validator.js';

export default class Compiler {
  labels;
  intermediate_code;
  machine_code = new Array(100).fill('000');
  error;

  constructor(text) {
    let validator = new Validator(text);
    if (validator.error == undefined) {
      this.labels = validator.labels;
      this.intermediate_code = this.getIntermediateCode(text, this.labels);
      this.machine_code = this.getMachineCode(this.intermediate_code);
    } else {
      this.error = validator.error;
    }
  }

  getIntermediateCode(text, labels) {
    let count = 0;
    let intermediateCode = '';
    let lines = text.split('\n').filter(Boolean);
    this.deletingComments(lines);
    lines.forEach(line => {
      intermediateCode += count.toString().padStart(2, '0');
      let items = line.split(' ').filter(Boolean);
      for (let i = 0; i < items.length; i++) {
        if (!this.isInstruction(items[i]) && labels.has(items[i])) {
          intermediateCode +=
              i ? ' ' + labels.get(items[i]).toString().padStart(2, '0') : '';
        } else {
          intermediateCode += ' ' + items[i].toString().padStart(2, '0');
          if (items[i] == 'DAT' && i == items.length - 1)
            intermediateCode += ' 00';
        }
      }
      intermediateCode += '\n';
      count++;
    });
    return intermediateCode;
  }

  deletingComments(lines) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('//')) {
        if (lines[i].indexOf('//') == 0)
          lines.splice(i, 1);
        else
          lines[i] = lines[i].slice(0, lines[i].indexOf('//'));
      }
    }
  }

  isInstruction(text) {
    let flag = false;
    for (let i = 0; !flag && i < instructions.length; i++) {
      if (instructions[i].mnemonic == text) {
        flag = true;
      }
    }
    return flag;
  }

  getMachineCode(intermediate_code) {
    let machine_code = new Array(100);
    for (let i = 0; i < machine_code.length; i++) {
      machine_code[i] = '000';
    }

    let lines = intermediate_code.split('\n');
    lines = lines.filter(Boolean);
    lines.forEach(line => {
      let items = line.split(' ');
      items = items.filter(Boolean);
      machine_code[parseInt(items[0])] =
          (this.getOpcode(items[1]) +
           parseInt((items.length == 3 ? items[2] : 0)))
              .toString()
              .padStart(3, '0');
    });

    return machine_code;
  }

  getOpcode(mnemonic) {
    for (let i = 0; i < instructions.length; i++) {
      if (instructions[i].mnemonic == mnemonic) {
        return instructions[i].opcode;
      }
    }
  }
}