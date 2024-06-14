export const instructions = [
  {mnemonic: 'ADD', opcode: 100}, {mnemonic: 'SUB', opcode: 200},
  {mnemonic: 'STA', opcode: 300}, {mnemonic: 'LDA', opcode: 500},
  {mnemonic: 'BRA', opcode: 600}, {mnemonic: 'BRZ', opcode: 700},
  {mnemonic: 'BRP', opcode: 800}, {mnemonic: 'INP', opcode: 901},
  {mnemonic: 'OUT', opcode: 902}, {mnemonic: 'HLT', opcode: 0},
  {mnemonic: 'DAT', opcode: null}
];

export function isInstruction(text) {
  let flag = false;
  for (let i = 0; !flag && i < instructions.length; i++) {
    if (instructions[i].mnemonic == text) {
      flag = true;
    }
  }
  return flag;
}

export default class Validator {
  text;
  labels;
  error;

  constructor(text) {
    text != '' ? this.text = this.deletingComments(text) : this.text = text;
    this.labels = this.getLabels(this.text);
    if (this.labels != undefined) this.error = this.validation(this.text);
  }

  deletingComments(text) {
    let result = '';
    let lines = text.split('\n').filter(Boolean);
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].includes('//')) {
        if (lines[i].indexOf('//') != 0)
          result += lines[i].slice(0, lines[i].indexOf('//')) + '\n';
      } else
        result += lines[i] + '\n';
    }
    return result;
  }

  getLabels(text) {
    let labels = new Map();
    let lines = text.split('\n').filter(Boolean);
    for (let i = 0; i < lines.length; i++) {
      let items = lines[i].split(' ').filter(Boolean);
      if (!isInstruction(items[0])) {
        if (!labels.has(items[0])) {
          labels.set(items[0], i);
        } else {
          this.error = {code: 'label already exist', line: i};
          return undefined;
        }
      }
    }
    return labels;
  }

  validation(text) {
    let lines = text.split('\n').filter(Boolean);
    for (let i = 0; i < lines.length; i++) {
      let items = lines[i].split(' ').filter(Boolean);

      let offset = 0;
      if (!isInstruction(items[0])) {
        offset++;
      }

      if (isInstruction(items[0 + offset])) {
        if (items.length < 3 + offset) {
          if (!['INP', 'OUT', 'HLT'].includes(items[0 + offset])) {
            if (items[0 + offset] == 'DAT' && items.length > 1 + offset &&
                Number.isNaN(Number(items[1 + offset]))) {
              return {code: 'incorrect register, expected value', line: i};
            } else if (
                items[0 + offset] != 'DAT' &&
                this.getRegister(items[1 + offset]) == null) {
              return {code: 'incorrect register, expected label', line: i};
            }
          } else if (items.length > 1 + offset) {
            return {code: 'incorrect line, many arguments', line: i};
          }
        } else {
          return {code: 'incorrect line, many arguments', line: i};
        }
      } else {
        return {code: 'incorrect instruction code', line: i};
      }
    }
  }

  getRegister(label) {
    if (this.labels.has(label)) {
      return this.labels.get(label);
    } else if (!Number.isNaN(Number(label))) {
      return label;
    }
    return null;
  }
}
