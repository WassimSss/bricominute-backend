function checkBody(body, keys) {
    let isValid = true;
  // console.log('body : ' , body);
    for (const field of keys) {
      // console.log(body[field], field);
      if (!body[field] || body[field] === '') {
        isValid = false;
      }
    }
  
    return isValid;
  }
  
  module.exports = { checkBody };