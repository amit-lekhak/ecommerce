"use strict";

/**
 * Get unique error field name
 */
const uniqueMessage = (error) => {
  let output;

  try {
    let fieldName = Object.keys(error.keyPattern);
    output = fieldName[0] + " already exists";
  } catch (ex) {
    output = "Unique field already exists";
  }

  return output;
};

/**
 * Get the erroror message from error object
 */
exports.errorHandler = (error) => {
  let message = "";

  if (error.code) {
    switch (error.code) {
      case 11000:
      case 11001:
        message = uniqueMessage(error);
        break;
      default:
        message = "Something went wrong";
    }
  } else {
    for (let errorName in error.errors) {
      if (error.errors[errorName].message) {
          if(error._message){
            message = error._message + ". " + error.errors[errorName].message;
          }else{
            message = error.errors[errorName].message;

          }
      }
    }
  }

  return message;
};
