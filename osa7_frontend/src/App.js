import React from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'
import blogService from './services/blogs'
import loginService from './services/login'
import userService from './services/users'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'

const Users = ({ users }) => {
  console.log(users)
  return (
    <div>
      <h2>users</h2>
      <table>
        <tr>
          <th>user</th>
          <th>blogs added</th>
        </tr>
        {users.map(u =>
          <tr key={u._id}>
            <td >
              {u.username}
            </td>
            <td>
              {u.blogs.length}
            </td>
          </tr>)}
      </table>
    </div>
  )
}

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      blogs: [],
      user: this.props.user
    }
  }

  componentDidMount() {
    blogService.getAll().then(blogs =>
      this.setState({ blogs })
    )
    console.log(this.state.blogs)
    console.log(this.props.blogs)
  }

  likeBlog = (id) => {
    return () => {
      const blog = this.state.blogs.find(b => b._id === id)
      const changedBlog = { ...blog, likes: blog.likes + 1 }

      blogService
        .update(id, changedBlog)
        .then(updated => {
          this.setState({
            blogs: this.state.blogs.map(b => b._id !== id ? b : updated)
          })
        })
    }
  }

  deleteBlog = (id) => {
    return () => {
      const blog = this.state.blogs.find(b => b._id === id)
      if (window.confirm(`do you want to delete '${blog.title}'`))
        blogService
          .remove(id)
          .then(Response => {
            this.setState({
              blogs: this.state.blogs.filter(b => b._id !== id),
              notif: `'${blog.title}' was deleted`
            })
            setTimeout(() => {
              this.setState({ notif: null })
            }, 5000)
          })
          .catch(error => {
            this.setState({
              notif: `'${blog.title}' was already deleted from the server`,
              blogs: this.state.blogs.filter(b => b.id !== id)
            })
            setTimeout(() => {
              this.setState({ notif: null })
            }, 5000)
          })
    }
  }

  render() {
    const BlogsByLike = this.state.blogs.sort(function (a, b) {
      return b.likes - a.likes
    })

    return (
      <div>
        <h2>blogs</h2>
        {BlogsByLike.map(blog =>
          <Blog
            key={blog._id}
            blog={blog}
            onLike={this.likeBlog(blog._id)}
            delete={this.deleteBlog(blog._id)}
            user={this.props.user}
          />
        )}
      </div>
    )
  }
}

class App extends React.Component {
  constructor() {
    super()
    this.state = {
      blogs: [],
      users: [],
      username: '',
      password: '',
      user: null,
      title: '',
      author: '',
      url: '',
      error: null,
      notif: null,
    }
  }

  componentDidMount() {
    blogService.getAll().then(blogs =>
      this.setState({ blogs })
    )
    userService.getAll().then(users =>
      this.setState({ users })
    )

    const loggedUserJSON = window.localStorage.getItem('loggedUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      this.setState({ user })
      blogService.setToken(user.token)
    }
  }

  logout = async (event) => {
    window.localStorage.removeItem('loggedUser')
  }

  login = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({
        username: this.state.username,
        password: this.state.password
      })
      blogService.setToken(user.token)
      window.localStorage.setItem('loggedUser', JSON.stringify(user))

      this.setState({ username: '', password: '', user })

    } catch (exception) {
      this.setState({
        username: '',
        password: '',
        error: 'wrong username or password'
      })
      setTimeout(() => {
        this.setState({ error: null })
      }, 5000)
    }
  }

  addBlog = async (event) => {
    event.preventDefault()
    const blog = {
      title: this.state.title,
      author: this.state.author,
      url: this.state.url
    }
    const newBlog = await blogService.create(blog)
    this.setState({
      blogs: this.state.blogs.concat(newBlog),
      title: '',
      author: '',
      url: '',
      notif: `a new blog '${newBlog.title}' by ${newBlog.author} added`
    })
    setTimeout(() => {
      this.setState({ notif: null })
    }, 5000)

  }

  handleLoginFieldChange = (event) => {
    this.setState({ [event.target.name]: event.target.value })
  }

  handleBlogFieldChange = (event) => {
    this.setState({ [event.target.name]: event.target.value })
  }

  render() {

    const blogForm = () => (
      <Togglable buttonLabel="new blog" ref={component => this.blogForm = component}>
        <BlogForm
          onSubmit={this.addBlog}
          title={this.state.title}
          author={this.state.author}
          url={this.state.url}
          handleChange={this.handleBlogFieldChange}
        />
      </Togglable>
    )

    if (this.state.user === null) {
      return (
        <div>
          <Notification type="error" message={this.state.error} />

          <h2>Kirjaudu sovellukseen</h2>
          <form onSubmit={this.login}>
            <div>
              käyttäjätunnus
            <input
                type="text"
                name="username"
                value={this.state.username}
                onChange={this.handleLoginFieldChange}
              />
            </div>
            <div>
              salasana
            <input
                type="password"
                name="password"
                value={this.state.password}
                onChange={this.handleLoginFieldChange}
              />
            </div>
            <button type="submit">kirjaudu</button>
          </form>
        </div>
      )
    }

    return (
      <div>
        <Router>
          <div>
            <h1>Blog App</h1>
            <Notification type="notif" message={this.state.notif} />
            <div>
              {this.state.user.name} logged in
              <button onClick={this.logout}> log out</button>
            </div>
            {blogForm()}
            <div>
              <Link to="/users">users</Link>&nbsp;
              <Link to="/">home</Link>
            </div>
            <Route exact path="/users" render={() => <Users users={this.state.users} />} />
            <Route exact path="/" render={() => <Home user={this.state.user} />} />
          </div>
        </Router>
      </div>
    )
  }
}


export default App;
