function FiltersFeatures(query) {
    const { minPrice, maxPrice, ratingsAverage, ratingsQuantity, price, pgt, plt, keyword } = query;
    const filter = {};
  
    if (price) {
      filter.price = Number(price);
    } else {
      if (minPrice && maxPrice) {
        filter.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
      } else if (pgt) {
        filter.price = { $gte: Number(pgt) };
      } else if (plt) {
        filter.price = { $lte: Number(plt) };
      } else if (minPrice) {
        filter.price = { $gte: Number(minPrice) };
      } else if (maxPrice) {
        filter.price = { $lte: Number(maxPrice) };
      }
    }
  
    if (ratingsAverage) {
      filter.ratingsAverage = Number(ratingsAverage);
    }
  
    if (ratingsQuantity) {
      filter.ratingsQuantity = Number(ratingsQuantity);
    }
  
    if (keyword && keyword.length >= 2) {
      const regex = new RegExp(keyword, 'i');
      filter.$or = [
        { title: { $regex: regex } },
        { description: { $regex: regex } },
        { "Category.name": { $regex: regex } },
        { "brand.name": { $regex: regex } },
        { "subcategories.name": { $regex: regex } },

      ];
    }
  
    return filter;
  }
  
  module.exports = FiltersFeatures;
  