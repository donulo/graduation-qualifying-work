import Validator from './Validator.js';
import { isInstruction } from './Validator.js';
import { instructions } from './Validator.js';

export default class Compiler {
    labels;
    intermediate_code;
    machine_code = new Array(100).fill('000');
    error;
    segments = {
        code: {
            CB: -1,
            CL: -1,
            mode: 'r-x'
        },
        data: {
            DB: -1,
            DL: -1,
            mode: "r--"
        },
        free: {
            FB: -1,
            FL: -1,
            mode: 'rw-'
        }
    };

    constructor(text) {
        let validator = new Validator(text);
        if (validator.error == undefined) {
            this.labels = validator.labels;
            this.intermediate_code = this.getIntermediateCode(validator.text, this.labels);
            this.error = this.dataSegmentValidatory(this.intermediate_code);
            if (this.error == undefined) {
                this.getSegments(this.intermediate_code);
                this.machine_code = this.getMachineCode(this.intermediate_code);
            }
        } else {
            this.error = validator.error;
        }
    }

    dataSegmentValidatory(intermediate_code) {
        let lines = intermediate_code.split('\n');
        lines = lines.filter(Boolean);
        for (let i = 0; i < lines.length - 1; i++) {
            let items = lines[i].split(' ');
            items = items.filter(Boolean);
            let items_offset = lines[i + 1].split(' ');
            items_offset = items_offset.filter(Boolean);

            if (items[1] == 'DAT' && items[1] != items_offset[1]) {
                return { code: "data segment", line: i + 1 };
            }
        }
        return undefined;
    }

    getSegments(intermediate_code) {
        let lines = intermediate_code.split('\n');
        lines = lines.filter(Boolean);
        for (let i = 0; i < lines.length; i++) {
            let items = lines[i].split(' ');
            items = items.filter(Boolean);
            if (items[1] == 'DAT' && this.segments.data.DB == -1) {
                this.segments.data.DB = i;
                this.segments.data.DL = lines.length - i - 1;
            }
        }
        this.segments.code.CB = 0;
        this.segments.code.CL = this.segments.data.DB == -1 ? lines.length - 1 : this.segments.data.DB - 1;
        this.segments.free.FB = lines.length;
        this.segments.free.FL = this.machine_code.length - lines.length - 1;
    }

    getIntermediateCode(text, labels) {
        let count = 0;
        let intermediateCode = '';
        let lines = text.split('\n').filter(Boolean);
        //this.deletingComments(lines);
        lines.forEach(line => {
            intermediateCode += count.toString().padStart(2, '0');
            let items = line.split(' ').filter(Boolean);
            for (let i = 0; i < items.length; i++) {
                if (!isInstruction(items[i]) && labels.has(items[i])) {
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
    /*
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
    */
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