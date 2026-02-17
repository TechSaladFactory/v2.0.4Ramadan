

function searchByname(query) {
    const {  keyword } = query;
    const filter = {};
    
    if (keyword && keyword.length >= 2) {
      const regex = new RegExp(keyword.trim(), 'i');
      filter.$or = [
        { name: { $regex: regex } },
        { title: { $regex: regex } },
        { "Department.name": { $regex: regex } },

      ];
    }
  
    return filter;
  }

module.exports = searchByname;
