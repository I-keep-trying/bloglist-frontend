/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import Togglable from './components/toggle'
import './App.css'

const Notification = ({ errorMessage, text, status }) => {
  if (errorMessage === null) {
    return null
  }

  return (
    <div text={text} status={status} className="error">
      {errorMessage.text}
    </div>
  )
}

/* const ButtonComponent = () => {
  return (
    <button type="button" onClick={(event) => window.alert('Confirmed')}>
      Confirm
    </button>
  )
} */

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [newBlogTitle, setNewBlogTitle] = useState('')
  const [newBlogAuthor, setNewBlogAuthor] = useState('')
  const [newBlogUrl, setNewBlogUrl] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  const inputRef = useRef()

  useEffect((isFocused) => {
    if (isFocused) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    const keyListener = (e) => {
      const selectedElement = document.body.querySelectorAll('#login')
      if (selectedElement[0].id === 'login' && e.key === 'Enter') {
        document.addEventListener('keydown', keyListener)

        e.preventDefault()
        handleLogin()
      }
    }
    return () => document.removeEventListener('keydown', keyListener)
  }, [])

  useEffect(() => {
    const keyListener = (e) => {
      if (user !== null) {
        const selectedElement = document.body.querySelectorAll('#blog')
        if (selectedElement[0].id === 'blog' && e.key === 'Enter') {
          document.addEventListener('keydown', keyListener)

          e.preventDefault()
          addBlog()
        }
      }
    }
    return () => document.removeEventListener('keydown', keyListener)
  }, [user])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleMessage = (data) => {
    setErrorMessage(data)
    setTimeout(() => {
      setErrorMessage(null)
    }, 3000)
  }

  const addBlog = (event) => {
    event.preventDefault()
    const blogObject = {
      title: newBlogTitle,
      url: newBlogUrl,
    }

    blogService
      .create(blogObject)

      .then((returnedBlog) => {
        setBlogs(blogs.concat(returnedBlog))
        setNewBlogTitle('')
        setNewBlogUrl('')
      })
      .catch((error) => {
        handleMessage({ text: error.response.data.error })
      })
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    if (username.length === 0) {
      handleMessage({ text: 'Please enter username' })
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
    try {
      const user = await loginService.login({
        username,
        password,
      })

      window.localStorage.setItem('logged-Blogapp-User', JSON.stringify(user))
      blogService.setToken(user.token)

      setUser(user)
      await blogService.getAll().then((blogs) => {
        setBlogs(blogs.filter((blog) => blog.user.id === user.id))
      })
      setUsername('')
      setPassword('')
    } catch (exception) {
      if (password.length === 0) {
        handleMessage({ text: 'Please enter password' })
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      } else {
        handleMessage({ text: 'Incorrect username or password' })
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      }
    }
  }

  const loginForm = (event) => {

    return (
      <Togglable buttonLabel="login">
        <form>
          <h2>Login</h2>
          {/*         <ButtonComponent /> */}
          <div>
            username
            <input
              id="login"
              autoFocus
              type="text"
              value={username}
              name="Username"
              ref={inputRef}
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div>
            password
            <input
              type="password"
              value={password}
              name="Password"
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button onClick={handleLogin} type="submit">
            login
          </button>
        </form>
      </Togglable>
    )
  }

  const handleLogout = async (event) => {
    event.preventDefault()
    window.localStorage.removeItem('logged-Blogapp-User')
    setUser(null)
    setBlogs([])
  }

  const handleTitleInput = (e) => {
    setNewBlogTitle(e.target.value)
  }

  const handleAuthorInput = (e) => {
    setNewBlogAuthor(e.target.value)
  }

  const handleUrlInput = (e) => {
    setNewBlogUrl(e.target.value)
  }

  const blogForm = (event) => {
    //  setElement('blog')
    return (
      <div>
        <form onSubmit={addBlog}>
          <h2>Add Blog:</h2>
          Title:{' '}
          <input
            id="blog"
            autoFocus
            ref={inputRef}
            value={newBlogTitle}
            onChange={handleTitleInput}
          />
          <br />
          Author: <input value={newBlogAuthor} onChange={handleAuthorInput} />
          <br />
          Url: <input value={newBlogUrl} onChange={handleUrlInput} />
          <br />
          <button type="submit">save</button>
          <div>
            {' '}
            {blogs.map((blog) => (
              <Blog key={blog.id} blog={blog} />
            ))}
          </div>
        </form>
      </div>
    )
  }

  return (
    <div>
      <Notification errorMessage={errorMessage} />
      <h2>Blogs</h2>

      {user === null ? (
        loginForm()
      ) : (
        <div>
          <p>{user.name} is logged in</p>
          <button onClick={handleLogout}>Logout</button>

          {blogForm()}
        </div>
      )}
    </div>
  )
}

export default App
