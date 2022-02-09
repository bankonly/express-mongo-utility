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

    async findByIdAndDelete(_id, body = { deletedAt: new Date() }, opts) {
        let update_option = { returnDocument: 'after', omitUndefined: true }
        if (opts) update_option = { ...update_option.omitUndefined, ...opts }
        return this.model.findByIdAndUpdate(_id, body, update_option)
    }

    async paginate(
        {
            many = true,
            limit = null,
            deletedAt = null,
            sort = { createdAt: -1 },
            sortDate = { startDate: null, endDate: null, field: "createdAt" },
            paginate = { page: 1, limit: 20, optional: true, dataSet: {}, summary: true },
            _id,
            condition = {},
            checkIsActive = true,
            populate,
            select = "-__v -updatedAt -deletedAt",
            search = { key: [], keyWord: null, options: "i" },
            throwError = false,
        }, req
    ) {
        if (!this.model) throw new Error("model is requried in find function");
        if (checkIsActive) {
            condition = { deletedAt: deletedAt, ...condition };
        }
        sortDate = { ...{ startDate: null, endDate: null, field: "createdAt" }, ...sortDate }

        paginate = { ...{ optional: true, dataSet: {}, summary: true }, ...paginate, }
        if (paginate.summary === "true") {
            paginate.summary = true
        }

        if (paginate.summary === "false") {
            paginate.summary = false
        }


        // New Added - 1
        if (sortDate.startDate && sortDate.endDate) {
            if (!sortDate.field) throw new Error(`400::missing sort field`)

            const startDate = new Date(sortDate.startDate + "00:00:00") || NaN
            const endDate = new Date(sortDate.endDate + "23:59:5") || NaN
            if (!startDate && !endDate) {
                throw new Error(`400::startDate, endDate invalid`)
            }

            condition[sortDate.field] = { $gte: sortDate.startDate + " 00:00:00", $lte: sortDate.endDate + " 23:59:59" }
        } // --End 1


        // search function.
        if (search.keyWord) {
            if (search.key.length < 1) throw new Error("400::search query is requried");
            if (!condition["$or"] && !Array.isArray(condition["$or"])) {
                condition["$or"] = []
            }
            for (let i = 0; i < search.key.length; i++) {
                condition["$or"].push({ [`${search.key[i]}`]: { $regex: search.keyWord, $options: "i" } })
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
        if ((paginate.optional && Object.keys(paginate.dataSet).length > 0) || !paginate.optional) {
            paginate.limit = parseInt(paginate.limit) || parseInt(paginate.dataSet.limit);
            paginate.page = parseInt(paginate.page) || parseInt(paginate.dataSet.page);

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

        if (throwError) {
            if (!result || result.length < 1) throw new Error(`400::CONTENT404`);
        }

        return result;
    };

    defaultOption(req, { searchField, sortDateField = "createdAt", deletedAt = null }) {
        let paginate_data = {}
        if (req.query.limit || req.query.page) {
            paginate_data = { limit: req.query.limit, page: req.query.page }
        }
        const query_option = { deletedAt, paginate: { dataSet: paginate_data, summary: req.query.summary }, search: { key: searchField, keyWord: req.query.q, }, sort: req.query.sort, sortDate: { startDate: req.query.startDate, endDate: req.query.endDate, field: sortDateField } }
        return query_option
    }

}

module.exports = Query

