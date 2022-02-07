const first_rule_allow = ["required", "optional", "objectid"];
const thrid_rule_allow = ["exist", "notexist", "enum", "array", "string", "number", "boolean", "object", "objectid", "file", "files", "params"];
const TYPE_ALLOW = ["body", "query"]
const validate = async ({ rule, req, excludeBody = true, type = "body", version = 2, checkDeletedData = true, mongoose, restrictKey = true }) => {
    if (!mongoose) throw new Error(`Init Validation failed missing mongoose`)
    let _body = {};

    if (!TYPE_ALLOW.includes(type)) throw new Error("invalid type rule")
    const rules_key = Object.keys(rule);

    if (restrictKey) {
        const body_key = Object.keys(req[type]);
        for (let i = 0; i < body_key.length; i++) {
            const key_body = body_key[i];
            if (!rules_key.includes(key_body)) throw new Error(`400${version === 2 ? "-" : "::"}${key_body.toUpperCase()}400`);
        }
    }

    if (rules_key.length === 0) throw new Error(`No rule given`);
    for (let i = 0; i < rules_key.length; i++) {
        let body = req[type]
        let rule_key = rules_key[i];
        const rule_data = rule[rule_key];
        let body_data = body[rule_key]
        const split_rule_key = rule_key.split("@");

        if (split_rule_key.length > 0) {
            body_data = body[split_rule_key[0]]
        }

        let target_key = rule_key;
        if (split_rule_key.length > 1) {
            target_key = split_rule_key[1];
        }

        const split_rule_msg = rule_data.split("|");
        if (split_rule_msg.length < 2) throw new Error("Invalid rule expect xx|xx");

        const first_rule = split_rule_msg[0];

        const second_rule = split_rule_msg[1];
        let third_rule = "";
        let split_third_rule = "";
        let key_update_check = "";
        let param_data = null;

        if (split_rule_msg.length === 3) {
            third_rule = split_rule_msg[2].split(":");
            split_third_rule = third_rule[0].split(".")
            if (split_third_rule.length > 1) {
                third_rule[0] = split_third_rule[0]
                key_update_check = split_third_rule[1]

                if (req.params[key_update_check]) {
                    if (!rule[key_update_check]) throw new Error("missing rule params")
                    param_data = req.params[key_update_check]
                }
            }

            if (third_rule[0] === "params") {
                body_data = req.params[rule_key]
                if (split_rule_key.length > 0) {
                    body_data = req.params[split_rule_key[0]]
                }
                body = req.params
            }

            if (!thrid_rule_allow.includes(third_rule[0])) {
                throw new Error(`Invalid thrid rule ${thrid_rule_allow}`);
            }
        }

        if (first_rule !== "optional" || body_data || (first_rule !== "optional" && req.files)) {

            if (third_rule[0] === "file") {
                if (!req.files || !req.files[rule_key] || Array.isArray(req.files[rule_key])) throw new Error(`400${version === 2 ? "-" : "::"}${second_rule}`);
                body_data = req.files[rule_key]
            }

            if (third_rule[0] === "files") {
                if (!req.files || !req.files[rule_key] || !Array.isArray(req.files[rule_key])) throw new Error(`400${version === 2 ? "-" : "::"}${second_rule}`);
                body_data = req.files[rule_key]
            }


            if (!first_rule_allow.includes(first_rule)) {
                throw new Error(`Invalid first rule ${first_rule_allow}`);
            }

            if ((first_rule === "required" || first_rule === "objectid") && !body_data && typeof body_data !== "boolean") {
                throw new Error(`400${version === 2 ? "-" : "::"}${second_rule}`);
            }

            if (first_rule === "objectid" && body_data && !body_data.toString().match(/^[0-9a-fA-F]{24}$/)) {
                throw new Error(`400${version === 2 ? "-" : "::"}${second_rule}OBJ`);
            }

            if (third_rule[0] === "exist" && !third_rule[1]) throw new Error(`exist rule required model name`);
            if (third_rule[0] === "exist" || third_rule[0] === "notexist" || third_rule[0] === "params") {

                let key_body_update_check = key_update_check
                let param_check = key_update_check
                const split_key_update_check = key_update_check.split("@")
                if (split_key_update_check.length > 1) {
                    key_body_update_check = split_key_update_check[0]
                    param_check = split_key_update_check[1]
                }

                let conf = { [`${target_key}`]: body_data }
                if (checkDeletedData) {
                    if (version === 2) conf.deleted_at = null
                    else conf.is_active = true
                }

                let mongoose_instance = _mongoose
                if (mongoose) mongoose_instance = mongoose

                let exist = await mongoose_instance.model(third_rule[1]).findOne(conf);
                if (key_update_check && third_rule[0] === "exist") {
                    if (!rule[key_update_check]) throw new Error("rule missing")
                    let body_check_data = body[key_body_update_check]
                    if (param_data) {
                        const exist_update = await mongoose_instance.model(third_rule[1]).findOne({ [`${param_check}`]: param_data });
                        if (!exist_update) throw new Error(`400${version === 2 ? "-" : "::"}${param_check.toUpperCase() + second_rule}`);
                        body_check_data = param_data
                    }

                    if (body_check_data === null || body_check_data === undefined || body_check_data === "") throw new Error(`400${version === 2 ? "-" : "::"}${rule[key_update_check].split("|")[1]}`)
                    if (exist && ((exist._id.toString() !== body_check_data) || (exist._id.toString() !== param_data))) throw new Error(`400${version === 2 ? "-" : "::"}${second_rule}EXISTED`);
                } else {
                    if ((third_rule[0] === "exist" && exist) || (third_rule[0] === "notexist" && !exist) || (third_rule[0] === "params" && !exist)) throw new Error(`400${version === 2 ? "-" : "::"}${second_rule}`);
                }
            }



            if (third_rule[0] === "enum") {
                if (!third_rule[1]) {
                    throw new Error(`enum rule required xx,xx`);
                }

                const valid_enum = third_rule[1].split(",");
                if (!valid_enum.includes(body_data)) {
                    throw new Error(`400${version === 2 ? "-" : "::"}${second_rule}`);
                }
            }

            function _validator(_third_rule, value, obj_field = "") {
                if (_third_rule === "array" && !Array.isArray(value)) throw new Error(`400${version === 2 ? "-" : "::"}${second_rule + obj_field.toUpperCase()}`);
                if (_third_rule === "string" && typeof value !== "string") throw new Error(`400${version === 2 ? "-" : "::"}${second_rule + obj_field.toUpperCase()}`);
                if (_third_rule === "number" && typeof value !== "number" && !parseInt(value)) throw new Error(`400${version === 2 ? "-" : "::"}${second_rule + obj_field.toUpperCase()}`);
                if (_third_rule === "boolean" && typeof value !== "boolean") throw new Error(`400${version === 2 ? "-" : "::"}${second_rule + obj_field.toUpperCase()}`);
                if (_third_rule === "object" && (typeof value !== "object" || Array.isArray(value))) throw new Error(`400${version === 2 ? "-" : "::"}${second_rule + obj_field.toUpperCase()}`);
                if (_third_rule === "objectid" && !value.toString().match(/^[0-9a-fA-F]{24}$/)) throw new Error(`400${version === 2 ? "-" : "::"}${second_rule + obj_field.toUpperCase()}`);
            }
            _validator(third_rule[0], body_data);

            if (third_rule[0] === "object" && third_rule.length > 1) {
                const third_obj_rule = third_rule[1].split(",");
                const object_key = Object.keys(body_data);
                if (first_rule === "required" && object_key.length < 1) throw new Error(`400${version === 2 ? "-" : "::"}${second_rule}`);
                if (third_obj_rule.length > 0) {
                    for (let obj_i = 0; obj_i < third_obj_rule.length; obj_i++) {
                        const obj_str_rule = third_obj_rule[obj_i];
                        const split_obj_str_rule = obj_str_rule.split("/");
                        const obj_field = split_obj_str_rule[0];
                        const obj_data = body_data[obj_field];

                        if (split_obj_str_rule.length > 1) {
                            const obj_rule = split_obj_str_rule[1].split("-");
                            if (obj_rule.length > 1) {
                                if (!first_rule_allow.includes(obj_rule[0])) {
                                    throw new Error(`Invalid object rule ${first_rule_allow}`);
                                }
                                if (obj_rule[0] === "required" && !obj_data && typeof obj_data !== "boolean") throw new Error(`400${version === 2 ? "-" : "::"}${second_rule + obj_field.toUpperCase()}`);
                                if ((obj_rule[0] === "optional" && obj_data !== "" && obj_data !== null && obj_data !== undefined) || obj_rule[0] === "required" || obj_data) {
                                    _validator(obj_rule[1], obj_data, obj_field);
                                }
                            } else {
                                _validator(obj_rule[0], obj_data, obj_field);
                            }
                        }
                    }
                }
            }
        }


        // if(key_update_check !== "_id"){
        _body[split_rule_key.length > 1 ? split_rule_key[0] : rule_key] = body_data;
        // }
    }

    if (!excludeBody) {
        return body;
    }
    return _body;
};

module.exports = validate;
