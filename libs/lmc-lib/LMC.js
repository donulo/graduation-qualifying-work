import Compiler from './Compiler.js';
import Instruction from './Instruction.js';

export default class LMC {
  controller = {
    input: '',
    output: '',
    program_counter: 0,
    accumulator: 0,
    memory: [100].fill('000')
  };
  compiler;

  constructor(text) {
    this.compiler = new Compiler(text);
    this.controller.memory = this.compiler.machine_code;
  }

  async step() {
    let instruction = new Instruction(
      this.controller.memory, this.controller.program_counter, this.compiler.segments);
    if (instruction.instruction != undefined)
      return await instruction.execute(this.controller);
    else
      return 'NOEXEC';
  }
}