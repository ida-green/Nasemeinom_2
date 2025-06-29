require('dotenv').config();
const sequelize = require('./database.js'); 
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000; 
const API_URL = process.env.API_URL || `http://localhost:${PORT}`; 

// 1. Маршруты для авторизации (регистрация, логин)
const authRoutes = require('./routes/authRoutes.js');
const authenticateToken = require('./middleware/auth.js');

// Импортируйте все ваши API маршруты
const userRoutes = require('./routes/userRoutes.js');
const favouriteRoutes = require('./routes/favouriteRoutes.js');
const cartRoutes = require('./routes/cartRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const forumRoutes = require('./routes/forumRoutes.js');
const likeRoutes = require('./routes/likeRoutes.js');
const changePasswordRoutes = require('./routes/changePasswordRoutes.js');
const locationRoutes = require('./routes/locationRoutes.js');
const educationForms = require('./routes/educationFormRoutes.js');


// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3001', // Замените на адрес вашего клиента
  credentials: true,
}));


// Импортируем модели
const User = require('./models/User.js');
const Children = require('./models/Children.js');
const EducationForm = require('./models/EducationForm.js');
const Gender = require('./models/Gender.js');
const FreeSchools = require('./models/FreeSchools.js');
const Course = require('./models/Course.js');
const Subject = require('./models/Subject.js');
const CourseFormat = require('./models/CourseFormat.js');
const Aspect = require('./models/Aspect.js');
const CourseSubject = require('./models/CourseSubject.js');
const CourseAspect = require('./models/CourseAspect.js');
const Author = require('./models/Author.js');
const AgeMin = require('./models/AgeMin.js');
const AgeMax = require('./models/AgeMax.js');
const GradeMin = require('./models/GradeMin.js');
const GradeMax = require('./models/GradeMax.js');
const Review = require('./models/Review.js');
const LiveGroup = require('./models/LiveGroup.js');
const LiveSession = require('./models/LiveSession.js');
const Provider = require('./models/Provider.js');
const PriceHistory = require('./models/PriceHistory.js');
const PriceOption = require('./models/PriceOption.js');

const Cart = require('./models/Cart.js');
const CartCourse = require('./models/CartCourse.js');

const Favourite = require('./models/Favourite.js');
const FavouriteCourse = require('./models/FavouriteCourse.js');

const Post = require('./models/Post.js');
const Comment = require('./models/Comment.js');

const Country = require('./models/Country.js');
const Region = require('./models/Region.js');
const City = require('./models/City.js');

const Like = require('./models/Like.js');

// Отношение между Пользователем и Детьми
Children.belongsTo(User, { foreignKey: 'user_id', as: 'parent' }); // 'as' может быть любым, например, 'user' или 'parent'
User.hasMany(Children, { foreignKey: 'user_id', as: 'children' });

Children.belongsTo(EducationForm, { foreignKey: 'education_form_id', as: 'education_form' });
EducationForm.hasMany(Children, { foreignKey: 'education_form_id'});

Children.belongsTo(Gender, { foreignKey: 'gender_id', as: 'gender' });
Gender.hasMany(Children, { foreignKey: 'gender_id'});

Course.belongsTo(Author, { foreignKey: 'author_id' });
Author.hasMany(Course, { foreignKey: 'author_id'});

Course.belongsTo(CourseFormat, { foreignKey: 'format_id' });
CourseFormat.hasMany(Course, { foreignKey: 'format_id'});

AgeMin.hasMany(Course, { foreignKey: 'age_min' });
Course.belongsTo(AgeMin, { foreignKey: 'age_min'});

AgeMax.hasMany(Course, { foreignKey: 'age_max' });
Course.belongsTo(AgeMax, { foreignKey: 'age_max'});

GradeMin.hasMany(Course, { foreignKey: 'grade_min' });
Course.belongsTo(GradeMin, { foreignKey: 'grade_min'});

GradeMax.hasMany(Course, { foreignKey: 'grade_max' });
Course.belongsTo(GradeMax, { foreignKey: 'grade_max'});

Course.hasMany(Review, { foreignKey: 'course_id' });
Review.belongsTo(Course, { foreignKey: 'course_id' });

Provider.hasMany(Course, { foreignKey: 'provider_id' });
Course.belongsTo(Provider, { foreignKey: 'provider_id' });

User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { foreignKey: 'user_id' });

Course.hasOne(LiveGroup, { foreignKey: 'course_id' });
LiveGroup.belongsTo(Course, { foreignKey: 'course_id' });

LiveGroup.hasMany(LiveSession, { foreignKey: 'livegroup_id' });
LiveSession.belongsTo(LiveGroup, { foreignKey: 'livegroup_id' });

Course.hasMany(PriceOption, { foreignKey: 'course_id' });
PriceOption.belongsTo(Course, { foreignKey: 'course_id' });

Course.belongsTo(PriceHistory, { foreignKey: 'pricehistory_id' });


// Ассоциации для корзины
Cart.belongsTo(User, { foreignKey: 'userId', as: 'users' });
User.hasMany(Cart, { foreignKey: 'userId', as: 'carts' });

Cart.belongsToMany(Course, { through: CartCourse, foreignKey: 'cartId', as: 'courses' });
Course.belongsToMany(Cart, { through: CartCourse, foreignKey: 'courseId', as: 'carts' });

Cart.hasMany(CartCourse, { foreignKey: 'cartId', as: 'cartcourses' });
CartCourse.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });
CartCourse.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
  
// Ассоциации для избранного
Favourite.belongsTo(User, { foreignKey: 'userId', as: 'users' });
User.hasMany(Favourite, { foreignKey: 'userId', as: 'favourites' });

Favourite.belongsToMany(Course, { through: FavouriteCourse, foreignKey: 'favouriteId', as: 'courses' });
Course.belongsToMany(Favourite, { through: FavouriteCourse, foreignKey: 'courseId', as: 'favourites' });

Favourite.hasMany(FavouriteCourse, { foreignKey: 'favouriteId', as: 'favouritecourses' });
FavouriteCourse.belongsTo(Favourite, { foreignKey: 'favouriteId', as: 'favourite' });
FavouriteCourse.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Новый форум
// Связь поста с пользователем
User.hasMany(Post, { foreignKey: 'user_id' });
Post.belongsTo(User, { foreignKey: 'user_id' });

// Связь поста с комментариями
Post.hasMany(Comment, { as: 'Comments', foreignKey: 'post_id' });
Comment.belongsTo(Post, { foreignKey: 'post_id' });

// Связь комментария с пользователем
User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });

// Связь комментариев между собой (родитель-ребенок)
Comment.hasMany(Comment, { as: 'children', foreignKey: 'parent_id' });
Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parent_id' });


// Страны, регионы и города для geoNames
Country.hasMany(Region, { foreignKey: 'country_id', as: 'regions' });
Region.belongsTo(Country, { foreignKey: 'country_id', as: 'country' });

Region.hasMany(City, { foreignKey: 'region_id', as: 'cities' });
City.belongsTo(Region, { foreignKey: 'region_id', as: 'region' });

// Город также принадлежит стране (для удобства, можно обойтись без этого,
// если всегда есть связь через регион, но для geonames лучше иметь)
Country.hasMany(City, { foreignKey: 'country_id', as: 'citiesDirect' }); // Используйте другое 'as' если Country уже hasMany City через Region
City.belongsTo(Country, { foreignKey: 'country_id', as: 'countryDirect' }); // Используйте другое 'as'

Country.hasMany(User, { foreignKey: 'country_id' });
User.belongsTo(Country, { foreignKey: 'country_id', as: 'country' });

Region.hasMany(User, { foreignKey: 'region_id' });
User.belongsTo(Region, { foreignKey: 'region_id', as: 'region' });

City.hasMany(User, { foreignKey: 'city_id' });
User.belongsTo(City, { foreignKey: 'city_id', as: 'city' });

EducationForm.hasMany(Children, { foreignKey: 'education_form_id' });
Children.belongsTo(EducationForm, { foreignKey: 'education_form_id' });

Subject.belongsToMany(Course, { through: CourseSubject, foreignKey: 'subject_id' });

Course.belongsToMany(Subject, { through: CourseSubject, foreignKey: 'course_id' });

Aspect.belongsToMany(Course, { through: CourseAspect, foreignKey: 'aspect_id' });

Course.belongsToMany(Aspect, { through: CourseAspect, foreignKey: 'course_id' });


// Определяем отношения для полиморфной модели Like.js
Post.hasMany(Like, {
  foreignKey: 'likeable_id',
  constraints: false,
  scope: {
      likeable_type: 'Post',
  },
});

Like.belongsTo(Post, {
  foreignKey: 'likeable_id',
  constraints: false,
  scope: {
      likeable_type: 'Post',
  },
});

Comment.hasMany(Like, {
  foreignKey: 'likeable_id',
  constraints: false,
  scope: {
      likeable_type: 'Comment',
  },
});

Like.belongsTo(Comment, {
  foreignKey: 'likeable_id',
  constraints: false,
  scope: {
      likeable_type: 'Comment',
  },
});

Review.hasMany(Like, {
  foreignKey: 'likeable_id',
  constraints: false,
  scope: {
      likeable_type: 'Review',
  },
});

Like.belongsTo(Review, {
  foreignKey: 'likeable_id',
  constraints: false,
  scope: {
      likeable_type: 'Review',
  },
});

// app.use('/api', authenticateToken, updateLastOnlineMiddleware); // УБРАТЬ/ЗАКОММЕНТИРОВАТЬ

app.use('/auth', authRoutes); // Маршруты для авторизации (регистрация, логин) - не защищены authenticateToken
app.use('/api/favourite', favouriteRoutes); // Маршруты для избранного
app.use('/api/cart', cartRoutes); // Маршруты для корзины
app.use('/api/forum', forumRoutes); // Маршруты форума
app.use('/api/likes', likeRoutes); // Маршруты лайков
app.use('/api/product', productRoutes); // Маршруты курсов
app.use('/api/auth', changePasswordRoutes); // Маршруты смены пароля
app.use('/api/users', userRoutes); // Маршруты пользователя
app.use('/api/locations', locationRoutes); // Маршруты локаций
app.use('/api/educationForms', educationForms); // Маршруты форм образования


// РАЗОБРАТЬСЯ, ЧТО ИЗ ЭТОГО ОСТАВИТЬ
{/*
// Подключаем маршруты API с префиксом /api
app.use('/api', apiRoutes);

// Добавьте другие маршруты или статические файлы, если они есть
// app.use(express.static('public'));

// Синхронизация моделей Sequelize с базой данных (осторожно в продакшене!)
// В разработке можно использовать sequelize.sync({ alter: true }) или sequelize.sync({ force: true })
// В продакшене лучше использовать миграции.
sequelize.sync()
    .then(() => {
        console.log('База данных синхронизирована.');
        app.listen(PORT, () => {
            console.log(`Сервер запущен на порту ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Ошибка синхронизации базы данных:', err);
    });
*/}


//Пример маршрута для получения всех свободных школ
app.get('/freeSchools', async (req, res) => {
 try {
   const freeSchools = await FreeSchools.findAll();
   res.json(freeSchools);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении свободных школ' });
  }
 });


// Добавьте базовый маршрут для проверки работы сервера
app.get('/', (req, res) => {
    res.send('Сервер API запущен!');
});

// Обработка 404 ошибок
app.use((req, res, next) => {
    res.status(404).send('Извините, запрашиваемый ресурс не найден!');
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Что-то пошло не так!');
});

// Синхронизация моделей и запуск сервера
const startServer = async () => {
  try {
    await sequelize.sync(); // Синхронизация моделей с базой данных
    console.log('База данных синхронизирована.');
    app.listen(PORT, () => {
      console.log(`Сервер запущен на http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Ошибка при синхронизации с базой данных:', error);
    process.exit(1); // Завершаем процесс с кодом ошибки
  }
};

startServer();
