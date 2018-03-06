import React from 'react'
import PropTypes from 'prop-types'
import { FormGroup, FormControl, ControlLabel, Button } from 'react-bootstrap'

const BlogForm = ({ onSubmit, handleChange, title, author, url }) => {
  return (
    <div>
      <h2>create new</h2>

      <form onSubmit={onSubmit}>
        <FormGroup bsSize="small">
          <ControlLabel>title:</ControlLabel>
          <FormControl
            type="text"
            name="title"
            value={title}
            placeholder="title"
            onChange={handleChange}
          />
          <ControlLabel>author:</ControlLabel>
          <FormControl
            type="text"
            name="author"
            value={author}
            placeholder="author"
            onChange={handleChange}
          />
          <ControlLabel>url:</ControlLabel>
          <FormControl
            type="text"
            name="url"
            value={url}
            placeholder="url"
            onChange={handleChange}
          />
          <Button bsStyle="success" type="submit">save</Button>
        </FormGroup>
      </form>
    </div>
  )
}

BlogForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired
}

export default BlogForm