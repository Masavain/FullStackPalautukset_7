let token = null

const blogs = [
  {
    _id: "5a451df7571c224a31b5c8ce",
    title: "testausblogi",
    author: "Matti",
    url: "asd.com",
    user: {
      _id: "5a437a9e514ab7f168ddf138",
      username: "masa",
      name: "Matti"
    }
  }
]

const setToken = (newToken) => {
    token = `bearer ${newToken}`
  }

const getAll = () => {
  return Promise.resolve(blogs)
}

export default { getAll, blogs, setToken, token }