import React from 'react'

const Notification = ({ type, message }) => {
  if (message === null) {
    return null
  }
  if (type === 'error') {
    return (
      <div className="error">
        {message}
      </div>
    )
  }
  if (type === 'notif') {
    return (
      <div className="notif">
        {message}
      </div>
    )
  }

}

export default Notification