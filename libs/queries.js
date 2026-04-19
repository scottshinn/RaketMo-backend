
const createData = async (model, data) => {
    try {
        let createData = null;
        if (Array.isArray(data)) {
            createData = await model.bulkCreate(data);
        } else {
            createData = await model.create(data);
        }
        return createData;
    } catch (err) {
        throw err;
    }
}

const setData = async (data, update) => {
    try {
        const setData= await data.set(update).save();
        return setData;
    } catch (err) {
        throw err;
    }
}

const findAndUpdate = async (model,query, updateData) => {
    try {
        const user = await model.findByPk(query);
        const updatedUser= await user.update(updateData);
        return updatedUser;
    } catch (err) {
        console.log('-------q err------------',err);
        throw err;
    }
}


const getData = async (model, query) => {
    try {
        const getData= await model.findOne(query);
        return getData;
    } catch (err) {
        throw err;
    }
}


const getAllData = async (model, query) => {
    try {
        const getData= await model.findAll(query);
        return getData;
    } catch (err) {
        throw err;
    }
}

const getLimitData = async (model, query,skp) => {
    try {
        const getData= await model.findAll(query).limit(10).offset(skp);
        return getData;
    } catch (err) {
        throw err;
    }
}

const checkEmail = async (model, email) => {
    try {
        const getData= await model.findOne({where:{email:email.toLowerCase(),deleted_at:null}});
        return getData;
    } catch (err) {
        throw err;
    }
}
const updateData = async (model, data,query) => {
    try {
        const updateData = await model.update(data,query);
        return updateData;
    } catch (err) {
        throw err;
    }
}

const destroyData = async (model, query) => {
    try {
        const destroyData = await model.destroy(query);
        return destroyData;
    } catch (err) {
        throw err;
    }
}
const restoreData = async (model, query) => {
    try {
        const restoreData = await model.restore(query);
        return restoreData;
    } catch (err) {
        throw err;
    }
}

const find_Create = async (model, query) => {
    try {
        const getDisliked = await model.findOrCreate(query);        
        return getDisliked
    } catch (err) {
        throw err;
    }
}
// where: { },
// defaults: { /* Your default values here if the record doesn't exist */ },
// upsert: true,

const countDocs = async (model, query) => {
    try {
        const count_ = await model.count(query);        
        return count_
    } catch (err) {
        throw err;
    }
}


module.exports={ 
    createData,getData,checkEmail,updateData,setData,findAndUpdate,destroyData,restoreData,getAllData,getLimitData,find_Create,countDocs
};

