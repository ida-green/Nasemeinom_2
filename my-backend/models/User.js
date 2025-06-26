const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database.js'); // Импортируйте ваш экземпляр sequelize

const bcrypt = require('bcrypt');

class User extends Model {
    static associate(models) {
        // Определите ассоциации здесь
    }

    // Метод для проверки пароля
    async validatePassword(password) {
        return await bcrypt.compare(password, this.password);
    }

    // Метод для обновления пароля
    async updatePassword(newPassword) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(newPassword, salt);
        await this.save(); // Сохранить изменения в базе данных
    }
}


{/*
  class User extends Model {
    static associate(models) {
        // Определите ассоциации здесь
    }

    static async beforeCreate(user) {
        const salt = await bcrypt.genSalt(10); // Генерируем salt
        user.password = await bcrypt.hash(user.password, salt); // Хешируем пароль
    }

    static async beforeUpdate(user) {
        if (user.changed('password')) { // Проверяем, был ли изменен пароль
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        }
    }

    // Метод для проверки пароля
    async validPassword(password) {
        return await bcrypt.compare(password, this.password);
    }

}
  */}



User.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  isSubscribed: {
    type: DataTypes.TINYINT(1),
    allowNull: true,
},
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  surname: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  login: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true, // Сделаем логин уникальным
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telegramUsername: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true, // Добавьте уникальность, если это необходимо
    validate: {
      is: /^[a-zA-Z0-9_]{5,32}$/ // Проверка на соответствие формату Telegram username
    }
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true, // Валидация для email
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
   country_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'countries', 
      key: 'id',
    },
  },
  region_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'regions', 
      key: 'id',
    },
  },
  city_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'cities', 
      key: 'id',
    },
  },
  familyDescription: {
    type: DataTypes.STRING,
    allowNull: true,
  },
   userImageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  familyImageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  confirmationToken: { // Новое поле для токена подтверждения
    type: DataTypes.STRING,
    allowNull: true, // Может быть пустым до подтверждения
  },
  isActive: { // Новое поле для статуса активации
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false, // По умолчанию неактивен
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true,
},
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true,
},
  last_online_at: {
    type: DataTypes.DATE, // Для хранения даты и времени
    allowNull: true, // Может быть null, если пользователь еще не был онлайн или давно
    defaultValue: DataTypes.NOW, // Можно установить текущее время при создании нового пользователя
  },
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
