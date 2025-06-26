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
            attributes: ['id', 'paidUser', 'userImageUrl', 'name', 'telegramUsername', 'description', 'familyDescription', 'familyImageUrl', 'last_online_at'],
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

module.exports = {
  getUserById,
};


module.exports = { searchUsers, getUserById };