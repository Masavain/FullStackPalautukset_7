import React from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'
import blogService from './services/blogs'
import loginService from './services/login'
import userService from './services/users'
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom'

const User = ({ user }) => {
  return (
    <div>
      <h2>{user.name}</h2>
      <h3>added blogs</h3>
      <ul>
        {user.blogs.map(b =>
          <li>{b.title}</li>)}
      </ul>
    </div>
  )
}

class Users extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      users: []
    }
  }
  componentDidMount() {
    userService.getAll().then(users =>
      this.setState({ users })
    )
  }

  render() {
    return (
      <div>
        <h2>users</h2>
        <table>
          <tr>
            <th>user</th>
            <th>blogs added</th>
          </tr>
          {this.state.users.map(u =>
            <tr key={u.id}>
              <td >
                <Link to={`/users/${u.id}`}>{u.name}</Link>
              </td>
              <td>
                {u.blogs.length}
              </td>
            </tr>)}
        </table>
      </div>
    )
  }

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

    const blogStyle = {
      paddingTop: 10,
      paddingLeft: 2,
      border: 'solid',
      borderWidth: 1,
      marginBottom: 5
    }

    return (
      <div>
        <h2>blogs</h2>
        {BlogsByLike.map(blog =>
          <div key={blog._id} style={blogStyle}>
            <Link to={`/blogs/${blog._id}`}>{blog.title} {blog.author}</Link>&nbsp;
              <button onClick={this.deleteBlog(blog._id)}>delete</button>
          </div>
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
      redirect: false
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
      notif: `a new blog '${newBlog.title}' by ${newBlog.author} added`,
      redirect: true
    })
    setTimeout(() => {
      this.setState({ notif: null })
    }, 5000)
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



  handleLoginFieldChange = (event) => {
    this.setState({ [event.target.name]: event.target.value })
  }

  handleBlogFieldChange = (event) => {
    this.setState({ [event.target.name]: event.target.value })
  }

  userById = (id) => this.state.users.find(u => u.id === id)
  blogById = (id) => this.state.blogs.find(b => b._id === id)

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
            <Route path="/users" render={() => <Users users={this.state.users} />} />
            <Route exact path="/" render={() => <Home user={this.state.user} />} />
            <Route path="/users/:id" render={({ match }) =>
              <User user={this.userById(match.params.id)} />} />
            <Route path="/blogs/:id" render={({ match, history }) =>
              <Blog history={history}
                blog={this.blogById(match.params.id)}
                onLike={this.likeBlog(match.params.id)}
                user={this.state.user}
              />} />
          </div>
        </Router>
      </div>
    )
  }
}


export default App;
