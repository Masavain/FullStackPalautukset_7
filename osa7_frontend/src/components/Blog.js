import React from 'react'

class Blog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      comment: '',
    }
  }
  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.addComment(this.props.blog._id, this.state.comment)
    this.setState({ comment: '' })
  }

  render() {


    const user = this.props.blog.user === undefined ? '' : `added by ${this.props.blog.user.name}`

    return (
      <div>
        <h2>{this.props.blog.title}</h2>
        <a href={this.props.blog.url}>{this.props.blog.url}</a>
        <div>has {this.props.blog.likes} likes
        <button onClick={this.props.onLike}>like</button>
        </div>
        <div>
          {user}
        </div>
        <h3>comments</h3>
        <ul>
          {this.props.blog.comments.map(c =>
            <li>{c}</li>)}
        </ul>
        <form onSubmit={this.handleSubmit}>
          <div>
              comment:
            <input type="text" name="comment" value={this.state.comment} onChange={this.handleChange}/>
          </div>
          <button type="submit">add comment</button>
        </form>
      </div>
    )
  }
}

export default Blog