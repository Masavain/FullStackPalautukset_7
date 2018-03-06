import React from 'react'

class Blog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
    }
  }

  toggle = () => {
    this.setState({ visible: !this.state.visible })
  }

  render() {
    const blogStyle = {
      paddingTop: 10,
      paddingLeft: 2,
      border: 'solid',
      borderWidth: 1,
      marginBottom: 5
    }
  
  
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
      </div>
    )
  }
}

export default Blog