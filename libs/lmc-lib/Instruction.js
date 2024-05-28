export default class Instruction {
  instruction;
  register;

  constructor(memory, program_counter) {
    this.instruction = parseInt((memory[program_counter])[0]);
    this.register = parseInt((memory[program_counter]).substring(1));
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

  async execute(controller) {
    switch (this.instruction) {
      case 0:
        return 'EXIT';
      case 9:
        if (this.register == 1) {
          var input = document.getElementById('input');
          var border = input.style.border;
          input.style.border = '1px solid red';
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
        controller.memory[this.register] =
            controller.accumulator.toString().padStart(3, '0');
        controller.program_counter++;
        return 'STORE';
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