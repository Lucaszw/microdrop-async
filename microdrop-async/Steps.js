class Steps {
  constructor(ms) {
    this.ms = ms;
  }

  async steps() {
    return this.ms.getState("step-model", "steps");
  }

  async currentStep() {
    return this.ms.getState("step-model", "step");
  }

  async currentStepNumber() {
    return (await this.ms.getState("step-model", "step-number")).stepNumber;
  }

  async deleteStep(stepNumber, timeout=10000) {
    const msg = {
      __head__: {plugin_name: this.ms.name},
      stepNumber: stepNumber
    };
    const steps = await this.steps();
    await this.validateStepNumber(steps.length - 2);
    await this.validateStepNumber(stepNumber);
    return (this.ms.triggerPlugin('step-model', 'delete-step', msg, timeout));
  }

  async insertStep(stepNumber, timeout=10000) {
    const msg = {
      __head__: {plugin_name: this.ms.name},
      stepNumber: stepNumber
    };
    await this.validateStepNumber(stepNumber);
    return (await this.ms.triggerPlugin("step-model", "insert-step",
      msg, timeout));
  }

  async updateStep(key, val, stepNumber, timeout=10000) {
    const msg = {
      __head__: {plugin_name: this.ms.name},
      data: {key: key, val: val, stepNumber: stepNumber}
    };
    await this.validateStepNumber(stepNumber);
    return (await this.ms.triggerPlugin("step-model", "update-step",
      msg, timeout));
  }

  async putSteps(steps, timeout=10000) {
    const msg = {
      __head__: {plugin_name: this.ms.name},
      steps: steps
    };
    return (await this.ms.putPlugin("step-model", "steps", msg, timeout));
  }

  async putStepNumber(stepNumber, timeout=10000) {
    const msg = {
      __head__: {plugin_name: this.ms.name},
      stepNumber: stepNumber
    };
    return (await this.ms.putPlugin("step-model", "step-number",
      msg, timeout));
  }

  async validateStepNumber(stepNumber){
    const LABEL = "<MicrodropAsync#Steps> validateStepNumber";
    const steps = await this.steps();
    if (stepNumber >= steps.length)
      throw(`${LABEL}::Step number out of reach`);
    if (stepNumber < 0)
      throw(`${LABEL}::Step number less than zero`);
    return true;
  }
}

module.exports = Steps;
