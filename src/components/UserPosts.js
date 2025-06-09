import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const UserPosts = ({ user }) => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchUserPosts = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/posts/${user.id}`);
                setPosts(response.data);
            } catch (error) {
                console.error('Error fetching user posts:', error);
            }
        };

        fetchUserPosts();
    }, [user.id]);

    return (
        <li className="list-group-item">
            <p>
                <a data-bs-toggle="collapse" href="#user-posts" aria-expanded="false" aria-controls="user-p">
                    Мои посты
                </a>
            </p>
            <div className="collapse" id="user-posts">
                <div className="card card-body">
                    <div className="row">
                        <ul>
                            {posts.map(post => (
                                <li key={post.id}>
                                    <Link to={`/posts/${post.id}`}>
                                        {post.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </li>
    );
};

export default UserPosts;
