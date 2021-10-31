import groupBy from "lodash/groupBy";
import React from "react";

import Option from "./OptionsComponent";

export function Category({ title, children }) {
  return (
    <details className="sub-options" open={true}>
      <summary>{title}</summary>
      {children}
    </details>
  );
}

export default function OptionsCategory({
  categories,
  options,
  optionValues,
  onOptionValueChange,
}) {
  const categoriesOptions = groupBy(options, "category");
  const _categories = ["undefined", ...categories];

  for (const categorieKey of Object.keys(categoriesOptions)) {
    if (!_categories.includes(categorieKey)) {
      _categories.push(categorieKey);
    }
  }

  return (
    <React.Fragment>
      {_categories.map((category) => {
        const categoryOptions = categoriesOptions[category];
        if (!categoryOptions) {
          return null;
        }

        const optionElements = categoryOptions.map((option) => (
          <Option
            key={option.name}
            option={option}
            value={optionValues[option.name]}
            onChange={onOptionValueChange}
          />
        ));

        if (category === "undefined") {
          return optionElements;
        }

        return (
          <Category key={category} title={category}>
            {optionElements}
          </Category>
        );
      })}
    </React.Fragment>
  );
}
