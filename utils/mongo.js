const findByIdAndUpdate = async (model, _id, body, opts) => {
  let update_option = { returnDocument: "after", omitUndefined: true };
  if (opts) update_option = { ...update_option.omitUndefined, ...opts };
  return model.findByIdAndUpdate(_id, body, update_option);
};

const findByIdAndDelete = async (model, _id, body = { deleted_at: new Date() }, opts) => {
  let update_option = { returnDocument: "after", omitUndefined: true };
  if (opts) update_option = { ...update_option.omitUndefined, ...opts };
  return model.findByIdAndUpdate(_id, body, update_option);
};

const paginate = async (
  model,
  {
    many = true,
    limit = null,
    deleted_at = null,
    sort = { created_at: -1 },
    paginate = { page: 1, limit: 20, optional: true, data_set: {}, summary: false },
    _id,
    condition = {},
    populate,
    select = "-__v -updated_at -deleted_at",
    search = { key: [], key_word: null, options: "i" },
    throw_error = true,
  }
) => {
  if (!model) throw new Error("model is required in find function");
  condition = { deleted_at: deleted_at, ...condition };
  paginate = { ...paginate };
  // search function.
  if (search.key.length > 0) {
    if (!search.key_word) throw new Error("400::search query is required");
    for (let i = 0; i < search.key.length; i++) {
      condition[search.key[i]] = { $regex: search.key_word, $options: "i" };
    }
  }

  if (_id) {
    if (!_.validateObjectId(_id)) throw new Error(`400-QUERY4001`);
    condition._id = _id.toString();
  }

  let result = null;
  if (!many) result = model.findOne(condition);
  else result = model.find(condition);

  // condition...,selection..
  if (populate) result = result.populate(populate);
  if (select) result = result.select(select);
  if (sort) result = result.sort(sort);

  if ((paginate.optional && Object.keys(paginate.data_set).length > 0) || !paginate.optional) {
    paginate.limit = parseInt(paginate.limit) || parseInt(paginate.data_set.limit);
    paginate.page = parseInt(paginate.page) || parseInt(paginate.data_set.page);

    if (!paginate.limit || !paginate.page) {
      throw new Error(`400::Page and Limit should be number`);
    }
    let skip = 0;
    if (paginate.page > 1) {
      skip = paginate.limit * paginate.page - paginate.limit;
    }

    result = await result.skip(skip).limit(paginate.limit);

    if (paginate.summary) {
      let summary_data = {};
      summary_data.total = await model.countDocuments(condition);
      summary_data.page = paginate.page;
      summary_data.limit = paginate.limit;
      summary_data.total_in_page = result.length;
      summary_data.total_page = Math.round(Math.round((summary_data.total / paginate.limit) * 2) / 2);
      summary_data.next = paginate.page + 1 > summary_data.total_in_page ? null : paginate.page + 1;
      summary_data.previous = paginate.page - 1 <= 0 ? null : paginate.page - 1;
      summary_data.data = result;
      result = summary_data;
    }
  } else {
    result = await result.limit(limit);
  }

  if (throw_error) {
    if (!result || result.length < 1) throw new Error(`400::CONTENT404`);
  }

  return result;
};

const default_option = (req, { search_field, sort_date_field = "created_at", is_active = true }) => {
  let paginate_data = {};
  if (req.query.limit || req.query.page) {
    paginate_data = { limit: req.query.limit, page: req.query.page };
  }
  const query_option = {
    is_active,
    paginate: { data_set: paginate_data, summary: req.query.summary },
    search: { key: search_field, key_word: req.query.q },
    sort: req.query.sort,
    sort_date: { start_date: req.query.start_date, end_date: req.query.end_date, field: sort_date_field },
  };
  return query_option;
};

const Query = {
  findByIdAndUpdate,
  findByIdAndDelete,
  paginate,
  default_option,
};

module.exports = Query;
