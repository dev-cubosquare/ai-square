type BaseComponentOptions = {
  component: string;
} & Record<string, unknown>;

export type FormSubmittedComponentOptions = {
  component: "form-submitted";
  description: string;
  title: string;
};

export type AssistantComponentOptions =
  | FormSubmittedComponentOptions
  | BaseComponentOptions;

export type AssistantComponentPayload = AssistantComponentOptions;

export function buildComponentMarkup(options: AssistantComponentOptions) {
  return `[component]${JSON.stringify(options)}[/component]`;
}

export function buildFormDataMarkup(formData: Record<string, unknown>) {
  return `[form-data]${JSON.stringify(formData)}[/form-data]`;
}

type MessageInstructions = string | string[];

interface BuildAssistantMessageOptions {
  formData?: Record<string, unknown>,
  component?: AssistantComponentOptions;
  instructions?: MessageInstructions;
}

export function buildAssistantMessage({
  formData,
  component,
  instructions,
}: BuildAssistantMessageOptions) {
  const parts: string[] = [];

  if(formData){
    parts.push(buildFormDataMarkup(formData))
  }

  if (component) {
    parts.push(buildComponentMarkup(component));
  }

  if (instructions) {
    const instructionText = Array.isArray(instructions)
      ? instructions.join("\n\n")
      : instructions;
    parts.push(instructionText);
  }

  return parts.join("\n\n");
}
