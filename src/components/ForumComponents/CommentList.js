import React, { useState } from 'react';
import Comment from './Comment';

const CommentList = ({ comments, setComments, postTitle, postId, newComment, setNewComment, onSubmit, activeForm, activeId, toggleForm, showChildrenMap, toggleChildrenVisibility }) => {
 
 
  return (
    <div>
      {comments.filter(comment => comment.parent_id === null).map(comment => (
        <Comment 
          key={comment.id} 
          comment={comment} 
          comments={comments} 
          setComments={setComments}
          postTitle={postTitle} 
          postId={postId}
          newComment={newComment} 
          setNewComment={setNewComment} 
          onSubmit={onSubmit}
          activeForm={activeForm}
          activeId={activeId}
          toggleForm={toggleForm}
          showChildren={showChildrenMap[comment.id]} // Передаем состояние видимости вложенных комментов
          toggleChildrenVisibility={toggleChildrenVisibility} // Передаем функцию для переключения видимости вложенных комментов
          showChildrenMap={showChildrenMap}
        />
      ))}
    
    </div>
  );
};

export default CommentList;
