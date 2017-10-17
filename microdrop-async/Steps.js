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
    return this.ms.getState("step-model", "step-number");
  }

  async putSteps(steps, timeout=10000) {
    const msg = {
      __head__: {plugin_name: this.ms.name},
      steps: steps
    };
    return this.ms.putPlugin("step-model", "steps", msg, timeout);
  }

}

module.exports = Steps;
