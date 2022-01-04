// Constructor func
function Validator(options) {
  let selectorRules = {};

  // Hàm thực hiện validate
  function validate(inputElement, rule) {
    var errorElement = inputElement.parentElement.querySelector(
      options.errorSelector
    );
    var errorMessage;

    // Lấy ra các rules là test() trong object selectorRules
    var rules = selectorRules[rule.selector];

    // Lặp qua từng rule là test func và kiểm tra
    // nếu có lỗi thì break khỏi vòng lặp
    for (let i = 0; i < rules.length; i++) {
      errorMessage = rules[i](inputElement.value);
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      inputElement.parentElement.classList.add("invalid");
    } else {
      errorElement.innerText = "";
      inputElement.parentElement.classList.remove("invalid");
    }

    // !! cast to boolean value
    return Boolean(errorMessage);
  }

  //   Lấy element của form cần validate
  var formElement = document.querySelector(options.form);

  if (formElement) {
    // Khi submit bo di hinh vi default
    formElement.onsubmit = (e) => {
      e.preventDefault();

      var isFormValid = true;

      // Lăp qua từng rule và validate all fields
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        var isValid = validate(inputElement, rule);

        if (isValid) isFormValid = false;
      });

      if (isFormValid) {
        // Truong hop submit vs onSubmit la method cua Validator
        if (typeof options.onSubmit === "function") {
          var enableInputs = formElement.querySelectorAll("[name]");
          var formValues = Array.from(enableInputs).reduce(
            (prev, input) => (prev[input.name] = input.value) && prev,
            {}
          );
          options.onSubmit(formValues);
        }
      } else {
        // submit voi hanh vi mac dinh, html
        formElement.submit();
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

      var inputElement = formElement.querySelector(rule.selector);

      if (inputElement) {
        // xử lý trường hợp blur khỏi input
        inputElement.onblur = function () {
          validate(inputElement, rule);
        };

        // xử lý trường hợp mỗi khi user nhập vào input
        inputElement.oninput = function () {
          var errorElement = inputElement.parentElement.querySelector(
            options.errorSelector
          );
          errorElement.innerText = "";
          inputElement.parentElement.classList.remove("invalid");
        };
      }
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
      return value.trim() ? undefined : msg || "Vui lòng nhập trường này";
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
