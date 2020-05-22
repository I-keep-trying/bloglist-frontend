import React from 'react'
const Blog = ({ blog }) => (
  <div>
    <a href={blog.url}> {blog.title}</a>{' '}
    <span>
      <i> {blog.author}</i>
    </span>{' '}
    <span>{blog.likes} likes </span>
  </div>
)

export default Blog
