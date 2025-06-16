const sequelize = require('../database.js');
const Comment = require('../models/Comment.js');
const Post = require('../models/Post.js'); // Импортируйте вашу модель поста
const Like = require('../models/Like.js'); 
const User = require('../models/User.js'); 
const { validationResult } = require('express-validator');

const convertUrlsToLinks = (text) => {
  const urlRegex = `/(\b(https?|ftp|file)://[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/ig`;
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
};

// Получение всех постов с предварительной сортировкой на сервере
const getPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (isNaN(page) || page < 1) {
    return res.status(400).json({ message: 'Invalid page number.' });
  }

  // Получаем параметры сортировки из запроса
  // По умолчанию: новые сначала (по 'createdAt' в порядке убывания 'DESC')
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = (req.query.order || 'DESC').toUpperCase(); // Приводим к верхнему регистру для Sequelize

  // Валидация параметров сортировки (хорошая практика)
  const allowedSortByFields = ['createdAt', 'updatedAt', 'title']; // Добавьте поля, по которым можно сортировать
  const allowedSortOrders = ['ASC', 'DESC'];

  if (!allowedSortByFields.includes(sortBy) || !allowedSortOrders.includes(sortOrder)) {
    return res.status(400).json({ message: 'Invalid sort parameters.' });
  }

  try {
    const offset = (page - 1) * limit;
    const { count: totalPosts, rows: posts } = await Post.findAndCountAll({
      offset,
      limit,
      include: [
        {
          model: User,
          attributes: ['name', 'userImageUrl'],
        },
        {
          model: Like, // Если нужно, можно добавить attributes и для Like
        },
      ],
      order: [ // Вот здесь добавляется сортировка!
        [sortBy, sortOrder]
        // Можно добавить вторичную сортировку, если нужно:cd
        // ['title', 'ASC'] 
      ],
      distinct: true, // Может понадобиться, если include с ассоциациями "многие-ко-многим" вызывает дублирование строк до агрегации
    });

    const formattedPosts = posts.map(post => ({
      ...post.toJSON(),
      content: convertUrlsToLinks(post.content),
    }));

    res.json({
      posts: formattedPosts,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
      // Можно также вернуть текущие параметры сортировки для UI
      sortBy,
      sortOrder
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении постов' });
  }
};


// Получение всех комментариев к посту с предварительной сортировкой на сервере
const getCommentsByPostId = async (req, res) => {
  const postId = req.params.id;

  // Получаем параметры сортировки для комментариев
  const sortBy = req.query.sortBy || 'createdAt'; // По умолчанию по дате создания
  const sortOrder = (req.query.order || 'DESC').toUpperCase(); // По умолчанию новые сначала ()

  // Валидация для полей сортировки
  const allowedSortByFields = ['createdAt', 'updatedAt', 'popularity']; // Добавили 'popularity'
  const allowedSortOrders = ['ASC', 'DESC'];

  if (!allowedSortByFields.includes(sortBy) || !allowedSortOrders.includes(sortOrder)) {
    return res.status(400).json({ message: 'Invalid sort parameters for comments.' });
  }

  try {
    // Здесь мы выбираем только корневые комментарии, где parent_id === null
    const comments = await Comment.findAll({
      where: { post_id: postId }, // <-- Теперь выбираются ВСЕ комментарии этого поста
      include: [
        {
          model: User,
          attributes: ['name', 'userImageUrl'],
        },
        {
          model: Like, // Включаем модель Likes для подсчета
          attributes: [[sequelize.fn('COUNT', sequelize.col('Likes.id')), 'likesCount']], // Подсчет лайков
          required: false // Убираем обязательное требование, если пусть лайков нет
        },
      ],
      group: ['Comment.id'], // Группируем по комментариям, чтобы можно было использовать COUNT
      order: sortBy === 'popularity' 
        ? [[sequelize.literal('likesCount'), sortOrder]] // Сортировка по количеству лайков
        : [[sortBy, sortOrder]], // Иначе обычная сортировка по полю
    });

    const formattedComments = comments.map(comment => ({
      ...comment.toJSON(),
      parent_id: comment.parent_id, // Явно добавляем parent_id на всякий случай
      content: convertUrlsToLinks(comment.content),
    }));

    res.json(formattedComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении комментариев' });
  }
};



// Добавление поста
const addPost = async (req, res) => {
  // Валидация
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Получаем данные из тела запроса
  const { title, content } = req.body;

  // Проверяем, что пользователь авторизован. Это КРИТИЧНО!
  if (!req.user) {
    return res.status(401).json({ message: 'Необходимо авторизоваться' });
  }

  const userId = req.user.id; // Получаем ID пользователя из объекта req.user

  try {
    const newPost = await Post.create({
      title,
      content,
      user_id: userId,
      likes: 0,
    });

    // Получаем пост с информацией о пользователе
    const createdPostWithUser = await Post.findByPk(newPost.id, {
      include: [{ model: User, attributes: ['name', 'userImageUrl'] }],
    });

    res.status(201).json(createdPostWithUser);
  } catch (error) {
    console.error('Ошибка при создании поста:', error);
    res.status(500).json({ message: 'Ошибка сервера при создании поста' });
  }
};



// Добавление комментария
const addComment = async (req, res) => {
  // Валидация
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Получаем содержание, postId и parentId из тела запроса
  const { content, postId, parentId } = req.body;

  // Проверка на наличие авторизации (получаем ID пользователя из req.user)
  if (!req.user) {
    return res.status(401).json({ message: 'Необходимо авторизоваться' });
  }

  const authenticatedUserId = req.user.id; // Используем id из токена

  try {
    const newComment = await Comment.create({
      content,
      user_id: authenticatedUserId, // Используем ID аутентифицированного пользователя
      post_id: postId,
      parent_id: parentId || null, // Если parentId отсутствует, устанавливаем null
      likes: 0, // Предполагаем, что лайков сначала 0
      // Sequelize автоматически добавит createdAt и updatedAt
    });

    // Получаем созданный комментарий с данными пользователя
    const createdCommentWithUser = await Comment.findByPk(newComment.id, {
      include: [{ model: User, attributes: ['name', 'userImageUrl'] }],
    });

    res.status(201).json(createdCommentWithUser); // Возвращаем комментарий с информацией об авторе

  } catch (error) {
    console.error('Ошибка при создании комментария:', error); // Логирование ошибки
    res.status(500).json({ message: 'Ошибка сервера при создании комментария' }); // Сообщение об ошибке
  }
};


// Редактирование поста
const editPost = async (req, res) => {
    const postId = req.params.id;
    const { title, content } = req.body;

    // Валидация
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Сначала находим пост (возможно, для проверок прав и времени)
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ message: 'Пост не найден' });
        }

        // Проверяем, является ли пользователь автором поста
        if (post.user_id !== req.user.id) {
            return res.status(403).json({ message: 'У вас нет прав редактировать этот пост' });
        }

        // Проверяем, прошли ли 24 часа с момента публикации
        const createdAt = new Date(post.createdAt);
        const now = new Date();
        const timeDifference = now - createdAt;
        const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
        if (hoursDifference > 24) {
            return res.status(403).json({ message: 'Редактирование возможно только в течение 24 часов после публикации' });
        }

        // Обновление поста
        post.title = title;
        post.content = content;
        await post.save(); // Сохраняем изменения в базе данных

        // === ВАЖНОЕ ИЗМЕНЕНИЕ ЗДЕСЬ ===
        // После сохранения, мы должны повторно найти пост,
        // но на этот раз с включенной информацией о пользователе,
        // чтобы фронтенд получил все необходимые данные для обновления.
        const updatedPost = await Post.findByPk(postId, {
            include: [{
                model: User, // Предполагается, что вы импортировали модель User и настроили ассоциацию
                as: 'User', // Укажите alias, если вы его использовали в ассоциации (например, Post.belongsTo(User, { as: 'User' }))
                attributes: ['name', 'userImageUrl'] // Укажите, какие поля пользователя вам нужны
            }]
        });

        // Возвращаем обновленный пост с данными пользователя
        res.status(200).json(updatedPost);

    } catch (error) {
        console.error('Ошибка при редактировании поста:', error);
        res.status(500).json({ message: 'Ошибка сервера при редактировании поста' });
    }
};


// Редактирование комментария
const editComment = async (req, res) => {
    // 1. Получаем ID комментария из параметров URL
    const commentId = req.params.id;
    // 2. Получаем только content из тела запроса, так как у комментария нет title
    const { content } = req.body;

    // Валидация (если у вас есть валидация для content)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // 3. Находим комментарий по ID
        const comment = await Comment.findByPk(commentId);

        // Если комментарий не найден
        if (!comment) {
            return res.status(404).json({ message: 'Комментарий не найден' });
        }

        // 4. Проверяем, является ли текущий пользователь автором комментария
        // req.user.id должен быть установлен в middleware аутентификации
        if (comment.user_id !== req.user.id) {
            return res.status(403).json({ message: 'У вас нет прав редактировать этот комментарий' });
        }

        // 5. Проверяем, прошли ли 24 часа с момента публикации
        // Логика аналогична посту
        const createdAt = new Date(comment.createdAt);
        const now = new Date();
        const timeDifference = now - createdAt;
        const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));

        if (hoursDifference > 24) {
            return res.status(403).json({ message: 'Редактирование комментария возможно только в течение 24 часов после публикации' });
        }

        // 6. Обновление содержимого комментария
        comment.content = content;
        await comment.save(); // Сохраняем изменения в базе данных

        // 7. После сохранения, повторно находим обновленный комментарий
        // с включенной информацией о пользователе, чтобы фронтенд получил полные данные
        const updatedComment = await Comment.findByPk(commentId, {
            include: [{
                model: User, // Предполагается, что у вас настроена ассоциация Comment.belongsTo(User)
                as: 'User', // Укажите алиас, который вы использовали в ассоциации (например, Comment.belongsTo(User, { as: 'User' }))
                attributes: ['name', 'userImageUrl'] // Поля пользователя, которые вам нужны на фронтенде
            }]
        });

        // 8. Возвращаем обновленный комментарий с данными пользователя
        res.status(200).json(updatedComment);

    } catch (error) {
        console.error('Ошибка при редактировании комментария:', error);
        res.status(500).json({ message: 'Ошибка сервера при редактировании комментария' });
    }
};

module.exports = { getPosts, getCommentsByPostId, addPost, addComment, editPost, editComment }