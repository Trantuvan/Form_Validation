// Constructor func
function Validator(options) {
  // get element cha co class la selector
  // class nay co chua errorElement
  function getParent(element, selector) {
    // while luon lap vs dk elem co elem cha
    // if elem la cap con
    while (element.parentElement) {
      // check elem cha co class la selector
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      // dk dung while, update elem con thanh elem cha
      element = element.parentElement;
    }
  }

  let selectorRules = {};

  // Hàm thực hiện validate
  function validate(inputElement, rule) {
    let parentElement = getParent(inputElement, options.formGroupSelector);
    let errorElement = parentElement.querySelector(options.errorSelector);
    let errorMessage;

    // Lấy ra các rules là test() trong object selectorRules
    let rules = selectorRules[rule.selector];

    // Lặp qua từng rule là test func và kiểm tra
    // nếu có lỗi thì break khỏi vòng lặp
    for (let i = 0; i < rules.length; i++) {
      switch (inputElement.type) {
        case "checkbox":
        case "radio":
          errorMessage = rules[i](
            formElement.querySelector(rule.selector + ":checked")
          );
          break;

        default:
          errorMessage = rules[i](inputElement.value);
          break;
      }
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      parentElement.classList.add("invalid");
    } else {
      errorElement.innerText = "";
      parentElement.classList.remove("invalid");
    }

    // !! cast to boolean value
    return Boolean(errorMessage);
  }

  //   Lấy element của form cần validate
  let formElement = document.querySelector(options.form);

  if (formElement) {
    // Khi submit bo di hinh vi default
    formElement.onsubmit = (e) => {
      e.preventDefault();

      let isFormValid = true;

      // Lăp qua từng rule và validate all fields
      options.rules.forEach(function (rule) {
        let inputElement = formElement.querySelector(rule.selector);
        let isValid = validate(inputElement, rule);

        if (isValid) isFormValid = false;
      });

      if (isFormValid) {
        // Truong hop submit vs onSubmit la method cua Validator
        if (typeof options.onSubmit === "function") {
          let enableInputs = formElement.querySelectorAll("[name]");
          let formValues = Array.from(enableInputs).reduce((values, input) => {
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
          options.onSubmit(formValues);
        }
      }
    };

    // Lăp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input...)
    options.rules.forEach(function (rule) {
      // Lưu lại các rules cho mỗi input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      let inputElements = formElement.querySelectorAll(rule.selector);

      Array.from(inputElements).forEach((inputElement) => {
        let parentElement = getParent(inputElement, options.formGroupSelector);

        if (inputElement) {
          // xử lý trường hợp blur khỏi input
          inputElement.onblur = function () {
            validate(inputElement, rule);
          };

          // xử lý trường hợp mỗi khi user nhập vào input
          inputElement.oninput = function () {
            let errorElement = parentElement.querySelector(
              options.errorSelector
            );
            errorElement.innerText = "";
            parentElement.classList.remove("invalid");
          };
        }
      });
    });
  }
}

// Định nghĩa rules
/**
 * Rules chung:
 *   1. Khi có lỗi: Trả message lỗi
 *   2. Khi hợp lệ: return undefined
 */
Validator.isRequired = function (selector, msg) {
  return {
    selector: selector,
    test: function (value) {
      return value ? undefined : msg || "Vui lòng nhập trường này";
    },
  };
};

Validator.isEmail = function (selector, msg) {
  return {
    selector: selector,
    test: function (value) {
      let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : msg || "Trường này phải là email";
    },
  };
};

Validator.minLength = function (selector, min, msg) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min
        ? undefined
        : msg || `Vui lòng nhập vào ${min} ký tự`;
    },
  };
};

Validator.isConfirmed = function (selector, getConfirmed, msg) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmed()
        ? undefined
        : msg || "Giá trị nhập vào không chính xác";
    },
  };
};
