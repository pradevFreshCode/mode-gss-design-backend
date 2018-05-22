const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userRoleSchema = Schema({
    _id: {
        type: Schema.Types.ObjectId,
        default: function () { return new mongoose.Types.ObjectId() }
    },
    name: String,
    created: {
        type: Date,
        default: Date.now
    }
});

const UserRole = mongoose.model('UserRole', userRoleSchema);

UserRole.STATIC_IDS = {
    USER_ROLE_ID: '5b02c74243da4239b8fb1e0e',
    ADMIN_ROLE_ID: '5b02c74243da4239b8fb1e0f'
};

UserRole._initializeIfEmpty = function() {
    UserRole.count().exec(function(err, count) {
        if (!count) {
            const modelsToInsert = [
                new UserRole({
                    _id: UserRole.STATIC_IDS.USER_ROLE_ID,
                    name: 'User'
                }),
                new UserRole({
                    _id: UserRole.STATIC_IDS.ADMIN_ROLE_ID,
                    name: 'Admin'
                }),
            ];

            UserRole.collection.insert(modelsToInsert, function(err, roles) {
                if(err) {
                    console.log(err);
                }

                console.log(`Roles inserted`);
            });
        } else {
            console.log('UserRoles table already not empty. Initialization don\'t needed');
        }
    });
};

module.exports = UserRole;