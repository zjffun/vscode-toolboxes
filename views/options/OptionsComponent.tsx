import { defaultTo } from "lodash";
import {
  Checkbox,
  Select,
  NumberInput,
  Input,
  FileInput,
  FolderInput,
} from "./InputsComponent";

export function BooleanOption({ option, value, onChange }) {
  return (
    <Checkbox
      label={option.label}
      title={option.description}
      checked={defaultTo(value, "")}
      onChange={(checked) => onChange(option, checked)}
    />
  );
}

export function ChoiceOption({ option, value, onChange }) {
  return (
    <Select
      label={option.label}
      title={option.description}
      values={option.choices.map((choice) =>
        typeof choice === "string" ? choice : choice.value
      )}
      selected={defaultTo(value, "")}
      onChange={(val) => onChange(option, val)}
    />
  );
}

export function NumberOption({ option, value, onChange }) {
  return (
    <NumberInput
      label={option.label}
      title={option.description}
      min={option?.range?.start}
      max={option?.range?.end}
      step={option?.range?.step}
      value={defaultTo(value, "")}
      onChange={(val) => onChange(option, val)}
    />
  );
}

export function StringOption({ option, value, onChange }) {
  return (
    <Input
      label={option.label}
      title={option.description}
      value={defaultTo(value, "")}
      onChange={(val) => onChange(option, val)}
    />
  );
}

export function FileOption({ option, value, onChange }) {
  return (
    <FileInput
      label={option.label}
      title={option.description}
      value={defaultTo(value, "")}
      onChange={(val) => onChange(option, val)}
    />
  );
}

export function FolderOption({ option, value, onChange }) {
  return (
    <FolderInput
      label={option.label}
      title={option.description}
      value={defaultTo(value, "")}
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
    case "string":
      return <StringOption {...props} />;
    case "file":
      return <FileOption {...props} />;
    case "folder":
      return <FolderOption {...props} />;
    default:
      throw new Error("unsupported type");
  }
}
