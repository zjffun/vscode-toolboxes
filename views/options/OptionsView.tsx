import { useEffect, useState } from "react";
import merge from "lodash/merge";
import { ErrorBoundary } from "./ErrorBoundry";
import getVsCode from "./getVsCode";
import OptionsCategory from "./OptionsCategory";

const vscode = getVsCode();

export default function OptionsView() {
  const [values, _setValues] = useState({});
  const [options, _setOptions] = useState([]);
  const [categories, _setCategories] = useState([]);

  useEffect(() => {
    window.addEventListener("message", (event) => {
      const message = event.data;
      switch (message?.type) {
        case "setOptions":
          _setOptions(message?.payload?.options || []);
          _setCategories(message?.payload?.categories || []);
          return;
        case "setValues":
          _setValues(message?.payload || {});
          return;
      }
    });
  }, []);

  const changeValue = (option, val) => {
    _setValues((values) => {
      const _values = merge({}, values, { [option.name]: val });
      vscode.postMessage({
        type: "setValues",
        payload: _values,
      });
      return _values;
    });
  };

  return (
    <ErrorBoundary>
      {options.length > 0 ? (
        <OptionsCategory
          categories={categories}
          options={options}
          optionValues={values}
          onOptionValueChange={changeValue}
        ></OptionsCategory>
      ) : (
        "No options"
      )}
    </ErrorBoundary>
  );
}
