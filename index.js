const textarea = document.querySelector("#jsonObj");
const result = document.querySelector("#resultJSON");
let jsonObject = null;

const prepareSchema = () => {
  if (textarea.value) {
    jsonObject = isJsonString(textarea.value) ? textarea.value : null;
    if (jsonObject) {
      jsonObject = JSON.parse(jsonObject);
      let jsonSchema = { $schema: "http://json-schema.org/draft-04/schema#" };
      jsonSchema = { ...jsonSchema, ...createObj(jsonObject) };
      result.textContent = stringify(jsonSchema);
    } else {
      alert("Enter valid JSON");
    }
  } else {
    alert('Input Value to continue');
  }
};

const createObj = (jsonObject) => {
  let obj = {
    type: prepareJsonType(jsonObject),
  };
  if (prepareJsonType(jsonObject) === "object") {
    obj = {
      type: "object",
      properties: {},
      required: Object.keys(jsonObject),
    };
    let type = "string";
    let items = [];
    let props = {};

    Object.keys(jsonObject).forEach((key) => {
      let temp_items = {};
      let temp_prop = {};
      type = prepareJsonType(jsonObject[key]);

      if (type === "array") {
        if (jsonObject[key] && jsonObject[key].length > 0) {
          items = jsonObject[key].map((i) => {
            console.log(i, "🤦‍♂️");
            return createObj(i);
          });
          // obj.properties[key]["items"] = items;
        } else {
          items = {};
        }
        temp_items = { items };
      } else if (type === "object") {
        if (jsonObject[key] && Object.keys(jsonObject[key]).length > 0) {
          props.properties = { ...createObj(jsonObject[key]) };
          temp_prop = props.properties;
        }
      }

      obj.properties[key] = {
        type,
        ...temp_items,
        ...temp_prop,
      };
    });
  } else if (prepareJsonType(jsonObject) === "array") {
    let items = jsonObject.map((i) => {
      return createObj(i);
    });
    obj["items"] = items;
  } else {
    console.log(jsonObject, "uncalled");
  }

  return obj;
};

const prepareJsonType = (value) => {
  let returnType = "string";

  if (typeof value === "number") {
    returnType = "integer";
  } else if (typeof value === "boolean") {
    returnType = "boolean";
  } else if (typeof value === "object") {
    if (Array.isArray(value)) {
      returnType = "array";
    } else if (value !== null) {
      returnType = "object";
    } else {
      returnType = "null";
    }
  } else {
    returnType = "string";
  }

  console.log(value, returnType);
  return returnType;
};

const copyContent = async () => {
  try {
    await navigator.clipboard.writeText(result.value);
    console.log("Content copied to clipboard");
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
};

const isJsonString = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

const stringify = (obj) => {
  let cache = [];
  let str = JSON.stringify(
    obj,
    function (key, value) {
      if (typeof value === "object" && value !== null) {
        if (cache.indexOf(value) !== -1) {
          // Circular reference found, discard key
          return;
        }
        // Store value in our collection
        cache.push(value);
      }
      return value;
    },
    2
  );
  cache = null; // reset the cache
  return str;
};
