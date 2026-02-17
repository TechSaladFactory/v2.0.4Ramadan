const moment = require("moment-timezone");
const mongoose = require("mongoose");

function convertDatesToSaudi(req, res, next) {
  const oldJson = res.json;

  res.json = function (data) {
    const seen = new WeakSet();

    const convert = (obj) => {
      if (obj instanceof Date || (typeof obj === "string" && !isNaN(Date.parse(obj)))) {
        return moment(obj).tz("Asia/Riyadh").format("YYYY-MM-DD HH:mm:ss");
      }

      if (obj instanceof mongoose.Types.ObjectId) {
        return obj.toString();
      }

      if (Array.isArray(obj)) {
        return obj.map((item) => convert(item));
      }

      if (obj && typeof obj === "object") {
        if (seen.has(obj)) return obj;
        seen.add(obj);

        const newObj = {};
        for (let key in obj) {
          if (key === "__v") continue;
          newObj[key] = convert(obj[key]);
        }
        return newObj;
      }

      return obj;
    };

    const convertedData = convert(data);
    return oldJson.call(this, convertedData);
  };

  next();
}

module.exports = convertDatesToSaudi;
