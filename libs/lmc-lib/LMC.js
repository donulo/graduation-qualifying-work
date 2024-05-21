import Compiler from "./Compiler.js";
import Instruction from "./Instruction.js";
export default class LMC {
    controller = {
        input: "",
        output: "",
        program_counter: 0,
        accumulator: 0,
        memory: []
    };
    compiler;

    constructor(text) {
        this.compiler = new Compiler(text);
        this.controller.memory = this.compiler.machine_code;
    }

    async step() {
        var instruction = new Instruction(this.controller.memory, this.controller.program_counter);
        return await instruction.execute(this.controller);
    }
}