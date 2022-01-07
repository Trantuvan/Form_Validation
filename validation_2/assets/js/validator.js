function Validator(formSelector, options = {}) {
  let formRules = {};

  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  /**
   * Quy ước rules:
   * 1. Nếu có lỗi return `error message`
   * 2. Nếu không có lỗi return `undefined`
   */
  let validatorRules = {
    required: function (value) {
      return value ? undefined : "Vui lòng nhập trường này";
    },
    email: function (value) {
      let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : "Trường này phải là email";
    },
    min: function (min) {
      return function (value) {
        return value.length >= min
          ? undefined
          : `Vui lòng nhập vào ít nhất ${min} ký tư`;
      };
    },
    max: function (max) {
      return function (value) {
        return value.length <= max
          ? undefined
          : `Vui lòng nhập vào nhiều nhất ${max} ký tư`;
      };
    },
  };
  // Lay ra formElement trong DOM theo `formSelector`
  let formElement = document.querySelector(formSelector);

  if (formElement) {
    let inputs = formElement.querySelectorAll("[name][rules]");

    for (let input of inputs) {
      let rules = input.getAttribute("rules").split("|");

      for (let rule of rules) {
        let isRuleHasValue = rule.includes(":");
        let ruleInfo;

        if (isRuleHasValue) {
          ruleInfo = rule.split(":");
          rule = ruleInfo[0];
        }

        let ruleFunc = validatorRules[rule];

        if (isRuleHasValue) ruleFunc = ruleFunc(ruleInfo[1]);

        if (Array.isArray(formRules[input.name])) {
          formRules[input.name].push(ruleFunc);
        } else {
          formRules[input.name] = [ruleFunc];
        }
      }
      // Lang nghe su kien de validate (blur, change ...)
      input.onblur = handleValidate;
      input.oninput = handleClearError;
    }
  }

  function handleValidate(evt) {
    let rules = formRules[evt.target.name];
    let errorMessage;

    rules.find((ruleFunc) => {
      errorMessage = ruleFunc(evt.target.value);
      return errorMessage;
    });

    if (errorMessage) {
      let formGroup = getParent(evt.target, ".form-group");

      if (formGroup) {
        formGroup.classList.add("invalid");
        let formMessage = formGroup.querySelector(".form-message");
        if (formMessage) {
          formMessage.innerText = errorMessage;
        }
      }
    }
    return !errorMessage;
  }

  function handleClearError(evt) {
    let formGroup = getParent(evt.target, ".form-group");

    if (formGroup.classList.contains("invalid")) {
      formGroup.classList.remove("invalid");
      let formMessage = formGroup.querySelector(".form-message");
      if (formMessage) {
        formMessage.innerText = "";
      }
    }
  }

  //   Xu ly hanh vi submit form
  formElement.onsubmit = function (evt) {
    evt.preventDefault();
    let inputs = formElement.querySelectorAll("[name][rules]");
    let isValid = true;

    inputs.forEach((input) => {
      if (handleValidate({ target: input })) {
        isValid = false;
      }
    });

    if (isValid) {
      if (typeof options.onSubmit === "function") {
        return options.onSubmit();
      }
      formElement.onsubmit();
    }
  };
}
