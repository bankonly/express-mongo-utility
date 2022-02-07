class Query {
    model
    constructor(model) {
        this.model = model
    }

    async findByIdAndUpdate(_id, body, opts) {
        let update_option = { returnDocument: 'after', omitUndefined: true }
        if (opts) update_option = { ...update_option.omitUndefined, ...opts }
        return this.model.findByIdAndUpdate(_id, body, update_option)
    }

    async findByIdAndDelete(_id, body = { is_active: true }, opts) {
        let update_option = { returnDocument: 'after', omitUndefined: true }
        if (opts) update_option = { ...update_option.omitUndefined, ...opts }
        return this.model.findByIdAndUpdate(_id, body, update_option)
    }

    async paginate(
        {
            many = true,
            limit = null,
            is_active = true,
            sort = { created_at: -1 },
            sort_date = { start_date: null, end_date: null, field: "created_at" },
            paginate = { page: 1, limit: 20, optional: true, data_set: {}, summary: true },
            _id,
            condition = {},
            check_is_active = true,
            populate,
            select = "-__v -updated_at -is_active",
            search = { key: [], key_word: null, options: "i" },
            throw_error = false,
        }, req
    ) {
        if (!this.model) throw new Error("model is requried in find function");
        if (check_is_active) {
            condition = { is_active: is_active, ...condition };
        }
        sort_date = { ...{ start_date: null, end_date: null, field: "created_at" }, ...sort_date }

        paginate = { ...{ optional: true, data_set: {}, summary: true }, ...paginate, }
        if (paginate.summary === "true") {
            paginate.summary = true
        }

        if (paginate.summary === "false") {
            paginate.summary = false
        }


        // New Added - 1
        if (sort_date.start_date && sort_date.end_date) {
            if (!sort_date.field) throw new Error(`400::missing sort field`)

            const start_date = new Date(sort_date.start_date + "00:00:00") || NaN
            const end_date = new Date(sort_date.end_date + "23:59:5") || NaN
            if (!start_date && !end_date) {
                throw new Error(`400::start_date, end_date invalid`)
            }

            condition[sort_date.field] = { $gte: sort_date.start_date + " 00:00:00", $lte: sort_date.end_date + " 23:59:59" }
        } // --End 1


        // search function.
        if (search.key_word) {
            if (search.key.length < 1) throw new Error("400::search query is requried");
            if (!condition["$or"] && !Array.isArray(condition["$or"])) {
                condition["$or"] = []
            }
            for (let i = 0; i < search.key.length; i++) {
                condition["$or"].push({ [`${search.key[i]}`]: { $regex: search.key_word, $options: "i" } })
            }
        }

        if (_id) {
            // if (!_.validateObjectId(_id)) throw new Error(`400-QUERY4001`);
            condition._id = _id.toString();
        }

        let result = null;
        if (!many) result = this.model.findOne(condition);
        else result = this.model.find(condition);

        // condition...,selection..
        if (populate) result = result.populate(populate);
        if (select) result = result.select(select);
        if (sort) {
            try {
                if (JSON.parse(sort)) {
                    sort = JSON.parse(sort)
                }
            } catch (error) {
            }
            result = result.sort(sort);
        }
        if ((paginate.optional && Object.keys(paginate.data_set).length > 0) || !paginate.optional) {
            paginate.limit = parseInt(paginate.limit) || parseInt(paginate.data_set.limit);
            paginate.page = parseInt(paginate.page) || parseInt(paginate.data_set.page);

            if (!paginate.limit || !paginate.page) {
                throw new Error(`400::Page and Limit should be number`)
            }
            let skip = 0;
            if (paginate.page > 1) {
                skip = paginate.limit * paginate.page - paginate.limit;
            }



            result = await result.skip(skip).limit(paginate.limit);

            if (paginate.summary === true) {
                let summary_data = {}
                summary_data.total = await this.model.countDocuments(condition)
                summary_data.page = paginate.page
                summary_data.limit = paginate.limit
                summary_data.total_in_page = result.length
                summary_data.total_page = Math.round(Math.round((summary_data.total / paginate.limit) * 2) / 2)
                summary_data.next = paginate.page + 1 > summary_data.total_in_page ? null : paginate.page + 1
                summary_data.previous = paginate.page - 1 <= 0 ? null : paginate.page - 1
                summary_data.data = result
                result = summary_data
            }
        } else {
            result = await result.limit(limit)
        }

        if (throw_error) {
            if (!result || result.length < 1) throw new Error(`400::CONTENT404`);
        }

        return result;
    };

    defaultOption(req, { search_field, sort_date_field = "created_at", is_active = true }) {
        let paginate_data = {}
        if (req.query.limit || req.query.page) {
            paginate_data = { limit: req.query.limit, page: req.query.page }
        }
        const query_option = { is_active, paginate: { data_set: paginate_data, summary: req.query.summary }, search: { key: search_field, key_word: req.query.q, }, sort: req.query.sort, sort_date: { start_date: req.query.start_date, end_date: req.query.end_date, field: sort_date_field } }
        return query_option
    }

}

module.exports = Query

