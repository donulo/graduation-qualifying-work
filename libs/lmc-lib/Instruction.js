export default class Instruction {
  instruction;
  register;
  segments;

  constructor(memory, program_counter, segments) {
    if (this.checkMode(program_counter, 'x', segments)) {
      this.instruction = parseInt((memory[program_counter])[0]);
      this.register = parseInt((memory[program_counter]).substring(1));
      this.segments = segments;
    }
  }

  promiseClick(button) {
    return new Promise((resolve) => {
      function listener(e) {
        resolve(e);
        button.removeEventListener('click', listener);
      }
      button.addEventListener('click', listener);
    });
  }

  checkMode(register, mode, segments = this.segments) {
    if (mode == 'r') {
      return true;
    }
    if (mode == 'w') {
      if (segments.free.FB <= register && register <= segments.free.FB + segments.free.FL)
        return true;
      else
        return false;
    }
    if (mode == 'x') {
      if (segments.code.CB <= register && register <= segments.code.CB + segments.code.CL)
        return true;
      else
        return false;
    }
  }

  async execute(controller) {
    switch (this.instruction) {
      case 0:
        return 'EXIT';
      case 9:
        if (this.register == 1) {
          let input = document.getElementById('input');
          let border = input.style.border;
          input.style.border = '2px solid rgba(255, 0, 0, 0.5)';
          await this.promiseClick(document.getElementById('sumbit'));
          controller.accumulator = parseInt(input.value);
          controller.program_counter++;
          input.style.border = border;
          return 'INPUT';
        }
        if (this.register == 2) {
          controller.output = controller.accumulator;
          controller.program_counter++;
          return 'OUPUT';
        }
      case 1:
        controller.accumulator += parseInt(controller.memory[this.register]);
        controller.program_counter++;
        return 'ADD';
      case 2:
        controller.accumulator -= parseInt(controller.memory[this.register]);
        controller.program_counter++;
        return 'SUB';
      case 3:
        if (this.checkMode(this.register, 'w')) {
          controller.memory[this.register] =
            controller.accumulator.toString().padStart(3, '0');
          controller.program_counter++;
          return 'STORE';
        }
        else {
          return 'NOSTORE';
        }
      case 5:
        controller.accumulator = parseInt(controller.memory[this.register]);
        controller.program_counter++;
        return 'LOAD';
      case 6:
        controller.program_counter = this.register;
        return 'BRA';
      case 7:
        if (controller.accumulator == 0)
          controller.program_counter = this.register;
        else
          controller.program_counter++;
        return 'BRZ';
      case 8:
        if (controller.accumulator >= 0)
          controller.program_counter = this.register;
        else
          controller.program_counter++;
        return 'BRP';
    }
  }
}