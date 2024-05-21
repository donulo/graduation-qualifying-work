export const instructions = [
    { mnemonic: "ADD", opcode: 100 },
    { mnemonic: "SUB", opcode: 200 },
    { mnemonic: "STA", opcode: 300 },
    { mnemonic: "LDA", opcode: 500 },
    { mnemonic: "BRA", opcode: 600 },
    { mnemonic: "BRZ", opcode: 700 },
    { mnemonic: "BRP", opcode: 800 },
    { mnemonic: "INP", opcode: 901 },
    { mnemonic: "OUT", opcode: 902 },
    { mnemonic: "HLT", opcode: 0 },
    { mnemonic: "DAT", opcode: null }];

export default class Validator {
    labels;
    error;

    constructor(text) {
        this.labels = this.getLabels(text);
        if (this.labels != undefined)
            this.error = this.validation(text);
    }

    getLabels(text) {
        var labels = new Map();
        var count = 0;
        var lines = text.split('\n').filter(Boolean);
        lines.forEach(line => {
            var items = line.split(" ").filter(Boolean);
            if (!this.isInstruction(items[0])) {
                if (!labels.has(items[0])) {
                    labels.set(items[0], count);
                }
                else {
                    this.error = { code: "label already exist", line: count };
                    return undefined;
                }
            }
            count++;
        });
        return labels;
    }

    validation(text) {
        var lines = text.split('\n').filter(Boolean);
        for (var i = 0; i < lines.length; i++) {
            var items = lines[i].split(' ').filter(Boolean);

            var offset = 0;
            if (!this.isInstruction(items[0])) {
                offset++;
            }

            if (this.isInstruction(items[0 + offset])) {
                if (items.length < 3 + offset) {
                    if (!["INP", "OUT", "HLT"].includes(items[0 + offset])) {
                        if (items[0 + offset] == "DAT" && items.length > 1 + offset && Number.isNaN(Number(items[1 + offset]))) {
                            return { code: "value was expected", line: i };
                        }
                        else if (items[0 + offset] != "DAT" && this.getRegister(items[1 + offset]) == null) {
                            return { code: "register was expected", line: i };
                        }
                    }
                    else if (items.length > 1 + offset) {
                        return { code: "incorrect line", line: i };
                    }
                }
                else {
                    return { code: "incorrect line", line: i };
                }
            }
        }
    }

    isInstruction(text) {
        var flag = false;
        for (var i = 0; !flag && i < instructions.length; i++) {
            if (instructions[i].mnemonic == text) {
                flag = true;
            }
        }
        return flag;
    }

    getRegister(label) {
        if (this.labels.has(label)) {
            return this.labels.get(label);
        }
        else if (!Number.isNaN(Number(label))) {
            return label;
        }
        return null;
    }
}
