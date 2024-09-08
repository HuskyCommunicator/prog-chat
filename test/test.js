const toCamelCase = (str) => {
  return str.replace(/_([a-z])/g, function (match, p1) {
    return String.fromCharCode(p1.charCodeAt(0) - 32);
  });
};
//const str = toCamelCase("user_id");
const convertDbObj2BizObj = (data) => {
  if (!data) {
    return null;
  }
  const bizData = {};
  for (let item in data) {
    bizData[toCamelCase(item)] = data[item];
  }
  return bizData;
};
const str = convertDbObj2BizObj({
  user_id: "111",
  user_name: "John",
  email: "john@gmail.com",
});
console.log(str);
