import { Checkbox, Select, NumberInput } from "./InputsComponent";

export function BooleanOption({ option, value, onChange }) {
  return (
    <Checkbox
      label={option.label}
      title={option.description}
      checked={value || ""}
      onChange={(checked) => onChange(option, checked)}
    />
  );
}

export function ChoiceOption({ option, value, onChange }) {
  return (
    <Select
      label={option.label}
      title={option.description}
      values={option.choices.map((choice) => choice.value)}
      selected={value || ""}
      onChange={(val) => onChange(option, val)}
    />
  );
}

export function NumberOption({ option, value, onChange }) {
  return (
    <NumberInput
      label={option.label}
      title={option.description}
      min={option.range.start}
      max={option.range.end}
      step={option.range.step}
      value={value || ""}
      onChange={(val) => onChange(option, val)}
    />
  );
}

export default function Option(props) {
  switch (props.option.type) {
    case "boolean":
      return <BooleanOption {...props} />;
    case "int":
      return <NumberOption {...props} />;
    case "choice":
      return <ChoiceOption {...props} />;
    default:
      throw new Error("unsupported type");
  }
}
