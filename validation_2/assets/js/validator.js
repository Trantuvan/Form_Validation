function Validator(formSelector) {
  // _this dai dien cho new instance of Validator
  let _this = this;
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

    for (let ruleFunc of rules) {
      errorMessage = ruleFunc(evt.target.value);
      if (errorMessage) break;
    }

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
    return Boolean(errorMessage);
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
    // this trong func nay chinh la form nao goi evt submit
    evt.preventDefault();

    let inputs = formElement.querySelectorAll("[name][rules]");
    let isValid = true;

    inputs.forEach((input) => {
      if (handleValidate({ target: input })) {
        isValid = false;
      }
    });

    if (isValid) {
      if (typeof _this.onSubmit === "function") {
        let formValues = Array.from(inputs).reduce((values, input) => {
          switch (input.type) {
            case "radio":
              values[input.name] = formElement.querySelector(
                'input[name="' + input.name + '"]:checked'
              ).value;
              break;

            case "checkbox":
              if (!Array.isArray(values[input.name])) {
                values[input.name] = [];
              }
              if (!input.matches(":checked")) {
                return values;
              }
              values[input.name].push(input.value);
              break;

            case "file":
              values[input.name] = input.files;
              break;

            default:
              values[input.name] = input.value;
              break;
          }
          return values;
        }, {});
        _this.onSubmit(formValues);
      } else {
        formElement.onsubmit();
      }
    }
  };
}
