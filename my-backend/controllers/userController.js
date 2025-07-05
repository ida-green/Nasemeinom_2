const { Op } = require('sequelize');
const User = require('../models/User.js'); 
const Country = require('../models/Country.js');
const Region = require('../models/Region.js');
const City = require('../models/City.js');
const Children = require('../models/Children.js');
const Gender = require('../models/Gender.js'); 
const EducationForm = require('../models/EducationForm.js'); 

async function searchUsers(req, res) {
    try {
        const { country_id, region_id, admin1_code, city_id, page = 1, per_page = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(per_page);
        const limit = parseInt(per_page);
        const whereCondition = {};

        // Фильтрация по стране, региону (admin1_code), городу
        if (country_id !== null && country_id !== undefined) {
            whereCondition.country_id = country_id;
        }
        if (region_id !== null && region_id !== undefined) {
            whereCondition.region_id = region_id; // Используем region_id
        }
        if (city_id !== null && city_id !== undefined) {
            whereCondition.city_id = city_id;
        }

        const { count, rows } = await User.findAndCountAll({
            attributes: ['id', 'isSubscribed', 'userImageUrl', 'name', 'telegramUsername', 'description', 'familyDescription', 'familyImageUrl', 'last_online_at'],
            where: whereCondition,
            include: [
                {
                    model: Country,
                    as: 'country',
                    attributes: ['id', 'name_en', 'name_ru'],
                    required: false
                },
                {
                    model: Region,
                    as: 'region',
                    attributes: ['id', 'name_en', 'name_ru', 'admin1_code'], 
                    required: false
                },
                {
                    model: City,
                    as: 'city',
                    attributes: ['id', 'country_id', 'admin1_code', 'name_en', 'name_ru' ],
                    required: false
                },
                {
                    model: Children,
                    as: 'children',
                    attributes: ['id', 'name', 'birth_date'],
                    required: false,
                    include: [
                        {
                            model: Gender,
                            as: 'gender',
                            attributes: ['gender'],
                            required: false
                        },
                        {
                            model: EducationForm,
                            as: 'education_form',
                            attributes: ['title'],
                            required: false
                        }
                    ]
                }
            ],
            order: [['last_online_at', 'ASC']],
            offset: offset,
            limit: limit
        });

        res.json({
            users: rows,
            pagination: {
                total_users: count,
                current_page: parseInt(page),
                total_pages: Math.ceil(count / limit),
                per_page: limit
            }
        });
    } catch (error) {
        console.error('Ошибка при поиске пользователей:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
    }
}

// Функция для получения пользователя по ID
const getUserById = async (req, res) => {
  const userId = req.params.id; // Получаем ID пользователя из параметров запроса
  try {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Children,
          as: 'children', // Алиас для детей
          include: [
            {
              model: EducationForm,
              as: 'education_form', // Алиас для формы образования
            },
            {
              model: Gender,
              as: 'gender', // Алиас для пола
            }
          ]
        },
       {
          model: Country,
          as: 'country',
       },   
      {
          model: Region,
          as: 'region',
      },    
      {
          model: City,
          as: 'city', 
      }    
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    res.status(500).json({ error: 'Ошибка при получении пользователя' });
  }
};

const getEducationForms = async (req, res) => {
    console.log('Запрос на получение форм обучения');
    try {
        const options = await EducationForm.findAll(); 
        res.json(options);
    } catch (error) {
        console.error('Ошибка при получении форм образования:', error);
        res.status(500).json({ error: 'Ошибка при получении данных' });
    }
};

const getGenders = async (req, res) => {
    console.log('Запрос на получение полов');
    try {
        const options = await Gender.findAll(); 
        res.json(options);
    } catch (error) {
        console.error('Ошибка при получении полов:', error);
        res.status(500).json({ error: 'Ошибка при получении данных' });
    }
};

// Обновление базовой информации о пользователе
const updateUserBasicInfo = async (req, res) => {
    const { name, surname, password, telegramUsername, email, phone } = req.body;

    // Проверка входящих данных
    if (!name && !surname && !password && !telegramUsername && !email && !phone) {
        return res.status(400).json({ error: 'Хотя бы одно поле должно быть указано для обновления' });
    }

    try {
        const userId = req.user.id; // Извлекаем id пользователя из токена
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const updatedFields = {};
        if (name) updatedFields.name = name;
        if (surname) updatedFields.surname = surname;
        if (password) updatedFields.password = password; // Обратите внимание на безопасность при обновлении пароля
        if (telegramUsername) updatedFields.telegramUsername = telegramUsername;
        if (email) updatedFields.email = email;
        if (phone) updatedFields.phone = phone;

        await user.update(updatedFields);
        res.json({ message: 'Основные данные пользователя успешно обновлены', user });
    } catch (error) {
        console.error('Ошибка при обновлении основных данных пользователя:', error);
        res.status(500).json({ error: 'Ошибка при обновлении основных данных пользователя' });
    }
};

// Обновление описания пользователя
const updateUserDescription = async (req, res) => {
    const { description } = req.body;

    if (!description) {
        return res.status(400).json({ error: 'Описание должно быть указано для обновления' });
    }

    try {
        const userId = req.params.id;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        await user.update({ description });
        res.json({ message: 'Описание пользователя успешно обновлено', user });
    } catch (error) {
        console.error('Ошибка при обновлении описания пользователя:', error);
        res.status(500).json({ error: 'Ошибка при обновлении описания пользователя' });
    }
};

// Обновление описания семьи
const updateUserFamilyDescription = async (req, res) => {
    const { familyDescription } = req.body;

    if (!familyDescription) {
        return res.status(400).json({ error: 'Семейное описание должно быть указано для обновления' });
    }

    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);
        if (!user) {
          return res.status(404).json({ error: 'Пользователь не найден' });
        }

        await user.update({ familyDescription });
        res.json({ message: 'Семейное описание пользователя успешно обновлено', user });
    } catch (error) {
        console.error('Ошибка при обновлении семейного описания пользователя:', error);
        res.status(500).json({ error: 'Ошибка при обновлении семейного описания пользователя' });
    }
};

// Обновление локации пользователя
const updateUserLocation = async (req, res) => {
    const userId = req.params.id;
    const { country_id, region_id, city_id } = req.body;

    if (!country_id && !region_id && !city_id) {
        return res.status(400).json({ message: 'Хотя бы одно поле должно быть заполнено' });
    }

    try {
        const user = await User.findByPk(userId); // Изменено на findByPk
        if (!user) {
            console.log('Пользователь не найден');
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Обновление только тех полей, которые были переданы в запросе
        if (country_id) user.country_id = country_id;
        if (region_id) user.region_id = region_id;
        if (city_id) user.city_id = city_id;

        await user.save();
        res.status(200).json({ message: 'Местоположение успешно обновлено' });
    } catch (error) {
        console.error('Ошибка при обновлении местоположения:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
};


// Обновление данных о детях пользователя
const updateUserChildren = async (req, res) => {
    const { children } = req.body; // Массив объектов детей
    const userId = req.params.id; // Получаем id пользователя из параметров

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const updatedChildren = [];

        for (const childData of children) {
            if (childData.deleted) {
                // Удаление ребенка
                const childToDelete = await Children.findByPk(childData.id);
                if (!childToDelete) {
                    throw new Error(`Ребенок с id ${childData.id} не найден`);
                }

                await childToDelete.destroy(); // Удаляем ребенка
                continue; // Переходим к следующему ребенку
            }

            if (childData.id) {
                // Обновление существующего ребенка
                const childToUpdate = await Children.findByPk(childData.id);
                if (!childToUpdate) {
                    throw new Error(`Ребенок с id ${childData.id} не найден`);
                }

                const updatedChild = await childToUpdate.update({
                    birth_date: childData.birth_date || childToUpdate.birth_date,
                    education_form_id: childData.education_form.id || childToUpdate.education_form.id,
                    gender_id: childData.gender.id || childToUpdate.gender.id,
                    user_id: userId // Добавляем user_id
                });

                updatedChildren.push(updatedChild);
            } else {
                // Добавление нового ребенка
                const newChild = await Children.create({
                    birth_date: childData.birth_date,
                    education_form_id: childData.education_form.id,
                    gender_id: childData.gender.id,
                    user_id: userId // Добавляем user_id
                });

                updatedChildren.push(newChild);
            }
        }

        // Уведомление для пользователя
        res.json({ message: 'Данные детей успешно обновлены', updatedChildren });
    } catch (error) {
        console.error('Ошибка при обновлении детей пользователя:', error);
        res.status(500).json({ error: 'Ошибка при обновлении данных детей пользователя' });
    }
};

const deleteChild = async (req, res) => {
    const { userId, childId } = req.params; // Получаем id пользователя и id ребенка из параметров

    try {
        // Находим пользователя
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        // Находим ребенка
        const childToDelete = await Children.findByPk(childId);
        if (!childToDelete) {
            return res.status(404).json({ error: `Ребенок с id ${childId} не найден` });
        }

        // Удаляем ребенка
        await childToDelete.destroy();

        // Уведомление для пользователя
        res.json({ message: 'Ребенок успешно удален' });
    } catch (error) {
        console.error('Ошибка при удалении ребенка:', error);
        res.status(500).json({ error: 'Ошибка при удалении ребенка' });
    }
};

// Обновление фото пользователя и фото семьи
const updateUserImages = async (req, res) => {
    const { userImageUrl, familyImageUrl } = req.body;

    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        await user.update({ userImageUrl, familyImageUrl });
        res.json({ message: 'Изображения пользователя успешно обновлены', user });
    } catch (error) {
        console.error('Ошибка при обновлении изображений пользователя:', error);
        res.status(500).json({ error: 'Ошибка при обновлении изображений пользователя' });
    }
};

module.exports = { searchUsers, getUserById, getEducationForms, getGenders, updateUserBasicInfo, updateUserDescription, updateUserFamilyDescription, updateUserLocation, updateUserChildren, updateUserImages, deleteChild };