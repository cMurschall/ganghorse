import axios from 'axios'


const apiBaseUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/'
    : (process.env.MODE === "spa"
        ? '/api/'
        : "http://backend:3000/")


// We create our own axios instance and set a custom base URL.
// Note that if we wouldn't set any config here we do not need
// a named export, as we could just `import axios from 'axios'`
const axiosInstance = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true
})



const blogGetAll = async () => {
    try {
        return (await axiosInstance.get("blog/posts")).data;
    } catch (error) {
        console.error('blogGetAll', error)
        return []
    }
}

const blogGetById = async (id) => {
    try {
        return (await axiosInstance.get("blog/posts"), { params: { id } }).data;
    } catch (error) {
        console.error('blogGetAll', error)
        return []
    }
}

const favoritesGetAll = async () => {
    try {
        return (await axiosInstance.get("favorite/all")).data;
    } catch (error) {
        console.error('favoritesGetAll', error)
        return []
    }
}

const favoriteAddNew = async (horseId) => {
    try {
        return (await axiosInstance.post("favorite/add", { horseId })).data;
    } catch (error) {
        console.error('favoriteAddNew', error)
        return false
    }
}

const favoriteRemove = async (horseId) => {
    try {
        return (await axiosInstance.post("favorite/remove", { horseId })).data;
    } catch (error) {
        console.error('favoriteRemove', error)
        return false
    }
}

const horseFindByOptions = async (options, page, userCurrency) => {
    try {
        const data = (await axiosInstance.post("horse/findByOptions", {
            options, page, userCurrency
        })).data
        return {
            horses: data[0],
            count: data[1]
        }
    } catch (error) {
        console.error('horseFindByOptions', error)
        return false
    }
}

const horseGetRange = async (userCurrency) => {
    try {
        return (await axiosInstance.post("horse/range", { userCurrency })).data
    } catch (error) {
        console.error('horseFindByOptions', error)
        return false
    }
}


const horseGetById = async (horseId) => {
    try {
        return (await axiosInstance.post("horse/findById", {
            id: horseId
        })).data

    } catch (error) {
        console.error('horseGetById', error)
        return false
    }
}

const horseGetOwn = async () => {
    try {
        return (await axiosInstance.post("horse/findOwn")).data
    } catch (error) {
        console.error('horseGetOwn', error)
        return false
    }
}

const horseCreate = async (horseData) => {
    try {
        return (await axiosInstance.post("horse/create", { horse: horseData })).data
    } catch (error) {
        console.error('horseCreate', error)
        return false
    }
}

const horseUpdate = async (horse) => {
    try {
        return (await axiosInstance.post("horse/update", horse)).data
    } catch (error) {
        console.error('horseUpdate', error)
        return false
    }
}

const horseRemove = async (horseId) => {
    try {
        return (await axiosInstance.delete("horse/remove", {
            data: {
                id: horseId
            }
        })).data
    } catch (error) {
        console.error('horseRemove', error)
        return false
    }
}

const horseChangeStatus = async (horseId, newStatus) => {
    try {
        return (await axiosInstance.post("horse/changeStatus", {
            data: {
                horseId,
                newStatus
            }
        })).data
    } catch (error) {
        console.error('horseChangeStatus', error)
        return false
    }
}

// returnds all horse ids 
const horseFindUserIds = async (userId) => {
    try {
        return (await axiosInstance.post("horse/findUsersIds", { userId })).data
    } catch (error) {
        console.error('horseFindUserIds', error)
        return []
    }
}

const imageAddNew = async (formData) => {
    try {
        const config = {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        };

        return (await axiosInstance.post("image/upload", formData, config)).data
    } catch (error) {
        console.error('imageAddNew', error)
        return false
    }
}

const imageRemove = async (id) => {
    try {
        return (await axiosInstance.post("image/upload", { imageId: { id }, })).data
    } catch (error) {
        console.error('imageRemove', error)
        return false
    }
}

const imageUpdateIndices = async (images) => {
    try {
        const payload = images.map((x, i) => {
            return {
                id: x.id,
                showIndex: i + 1,
            };
        })
        return (await axiosInstance.post("image/updateIndex", payload)).data
    } catch (error) {
        console.error('imageUpdateIndices', error)
        return false
    }
}



// more image todo



const locationFindById = async (locationId) => {
    try {
        return (await axiosInstance.post("location/findById", {
            id: locationId,
        })).data;
    } catch (error) {
        console.error('locationFindById', error)
        return false
    }
}

const locationFindByPostalcode = async ({ postalCode, countryCode }) => {
    try {
        return (await axiosInstance.post("location/findByPostalcode", {
            postalCode,
            countryCode
        })).data;
    } catch (error) {
        console.error('locationFindByPostalcode', error)
        return false
    }
}

const messageFindByTopic = async (topicId) => {
    try {
        return (await axiosInstance.post("message/findByTopic", {
            input: {
                topicId
            }
        })).data;
    } catch (error) {
        console.error('findMessageByTopic', error)
        return false
    }
}

const messageAddNew = async (message) => {
    try {
        return (await axiosInstance.post("message/add",
            {
                topicId: message.topic,
                text: message.text
            })).data;
    } catch (error) {
        console.error('addMessage', error)
        return false
    }
}

const userWhoAmI = async () => {
    try {
        return (await axiosInstance.get("user/whoAmI")).data;
    } catch (error) {
        console.error('userWhoAmI', error)
        return false
    }
}

const userInfo = async (userId) => {
    try {
        return (await axiosInstance.post("user/userInfo", { userId })).data;
    } catch (error) {
        console.error('userInfo', error)
        return false
    }
}

const userRegister = async ({ email, password, username }) => {
    try {
        return (await axiosInstance.post("user/register", { email, password, username })).data;
    } catch (error) {
        console.error('userRegister', error)
        return false
    }
}

const userConfirm = async (token) => {
    try {
        return (await axiosInstance.post("user/confirmUser", { token })).data;
    } catch (error) {
        console.error('userConfirm', error)
        return false
    }
}

const userUpdate = async (user) => {
    try {
        return (await axiosInstance.post("user/updateUser", user)).data;
    } catch (error) {
        console.error('userConfirm', error)
        return false
    }
}

const userLogin = async (loginData) => {
    try {
        return (await axiosInstance.post("user/login", loginData)).data;
    } catch (error) {
        console.error('userLogin', error)
        return false
    }
}

const userLogout = async () => {
    try {
        return (await axiosInstance.post("user/logout")).data;
    } catch (error) {
        console.error('userLogout', error)
        return false
    }
}

const userForgotPassword = async (resetData) => {
    try {
        return (await axiosInstance.post("user/forgotPassword", resetData)).data;
    } catch (error) {
        console.error('userForgotPassword', error)
        return false
    }
}

const userChangeForgotPassword = async (resetData) => {
    try {
        return (await axiosInstance.post("user/changeForgotPassword", resetData)).data;
    } catch (error) {
        console.error('userChangeForgotPassword', error)
        return false
    }
}

const userChangePassword = async ({ oldpassword, newpassword }) => {
    try {
        return (await axiosInstance.post("user/changePassword", { oldpassword, newpassword })).data;
    } catch (error) {
        console.error('userChangePassword', error)
        return false
    }
}

const userDeleteAccount = async () => {
    try {
        return (await axiosInstance.post("user/delete")).data;
    } catch (error) {
        console.error('userDeleteAccount', error)
        return false
    }
}

const userSearchGetAll = async () => {
    try {
        return (await axiosInstance.get("userSearch/all")).data;
    } catch (error) {
        console.error('userSearchGetAll', error)
        return false
    }
}

const userSearchAddNew = async (search) => {
    try {
        return (await axiosInstance.post("userSearch/add", search)).data;
    } catch (error) {
        console.error('userSearchAddNew', error)
        return false
    }
}

const userSearchRemove = async (label) => {
    try {
        return (await axiosInstance.post("userSearch/remove", { label })).data;
    } catch (error) {
        console.error('userSearchRemove', error)
        return false
    }
}

const videoFindById = async (id) => {
    try {
        return (await axiosInstance.post("video/findById", { videoId: { id } })).data;
    } catch (error) {
        console.error('videoFindById', error)
        return false
    }
}

const videoSaveYoutube = async (horseId, youtubeUrl) => {
    try {
        return (await axiosInstance.post("video/saveYoutube", {
            youtubeData: {
                horseId,
                youtubeUrl
            },
        })).data;
    } catch (error) {
        console.error('videoSaveYoutube', error)
        return false
    }
}

const videoCreateUrl = async ({ horseId, fileName, fileType }) => {
    try {
        return (await axiosInstance.post("video/createUrl", { horseId, fileName, fileType })).data;
    } catch (error) {
        console.error('videoCreateUrl', error)
        return false
    }
}



const worldfengurFindById = async (feifId) => {
    try {
        return (await axiosInstance.post("worldfengur/findById", { feifId })).data;
    } catch (error) {
        console.error('worldfengurFindById', error)
        return false
    }
}


const conversationGetAll = async () => {
    try {
        return (await axiosInstance.get("conversation/")).data;
    } catch (error) {
        console.error('conversationGetAll', error)
        return false
    }
}







export {
    apiBaseUrl,

    blogGetAll,
    blogGetById,

    favoritesGetAll,
    favoriteAddNew,
    favoriteRemove,

    horseFindByOptions,
    horseGetRange,
    horseGetById,
    horseGetOwn,
    horseCreate,
    horseUpdate,
    horseRemove,
    horseChangeStatus,
    horseFindUserIds,

    imageAddNew,
    imageUpdateIndices,
    imageRemove,

    locationFindById,
    locationFindByPostalcode,

    messageFindByTopic,
    messageAddNew,

    userWhoAmI,
    userInfo,
    userRegister,
    userConfirm,
    userUpdate,
    userLogin,
    userLogout,
    userForgotPassword,
    userChangeForgotPassword,
    userChangePassword,
    userDeleteAccount,

    userSearchGetAll,
    userSearchAddNew,
    userSearchRemove,

    videoFindById,
    videoSaveYoutube,
    videoCreateUrl,

    worldfengurFindById,

    conversationGetAll
};