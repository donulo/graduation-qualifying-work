import Validator from './Validator.js';
import { instructions } from './Validator.js';

export default class Compiler {
    labels;
    intermediate_code;
    machine_code;
    error;

    constructor(text) {
        var validator = new Validator(text);
        if (validator.error == undefined) {
            this.labels = validator.labels;
            this.intermediate_code = this.getIntermediateCode(text, this.labels);
            this.machine_code = this.getMachineCode(this.intermediate_code);
        }
        else {
            this.error = validator.error;
        }
    }

    getIntermediateCode(text, labels) {
        var count = 0;
        var intermediateCode = "";
        var lines = text.split('\n').filter(Boolean);
        this.deletingComments(lines);
        lines.forEach(line => {
            intermediateCode += count.toString().padStart(2, "0");
            var items = line.split(" ").filter(Boolean);
            for (var i = 0; i < items.length; i++) {
                if (!this.isInstruction(items[i]) && labels.has(items[i])) {
                    intermediateCode += i ? ' ' + labels.get(items[i]).toString().padStart(2, "0") : '';
                }
                else {
                    intermediateCode += ' ' + items[i].toString().padStart(2, "0");
                    if (items[i] == "DAT" && i == items.length - 1)
                        intermediateCode += ' 00';
                }
            }
            intermediateCode += "\n";
            count++;
        });
        return intermediateCode;
    }

    deletingComments(lines) {
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].includes("//")) {
                if (lines[i].indexOf("//") == 0)
                    lines.splice(i, 1);
                else
                    lines[i] = lines[i].slice(0, lines[i].indexOf("//"));
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

    getMachineCode(intermediate_code) {
        var machine_code = new Array(100);
        for (var i = 0; i < machine_code.length; i++) {
            machine_code[i] = "000";
        }

        var lines = intermediate_code.split("\n");
        lines = lines.filter(Boolean);
        lines.forEach(line => {
            var items = line.split(" ");
            items = items.filter(Boolean);
            machine_code[parseInt(items[0])] = (this.getOpcode(items[1]) + parseInt((items.length == 3 ? items[2] : 0))).toString().padStart(3, "0");
        });

        return machine_code;
    }

    getOpcode(mnemonic) {
        for (var i = 0; i < instructions.length; i++) {
            if (instructions[i].mnemonic == mnemonic) {
                return instructions[i].opcode;
            }
        }
    }
}