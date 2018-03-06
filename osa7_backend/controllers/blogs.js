const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
        .find({})
        .populate('user', { username: 1, name: 1 })
    response.json(blogs)

})

blogsRouter.delete('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)

    try {
        const token = request.token
        const decodedToken = jwt.verify(token, process.env.SECRET)

        if (!token || !decodedToken.id) {
            return response.status(401).json({ error: 'token missing or invalid' })
        }

        console.log(blog.user, decodedToken.id)

        if (blog.user && decodedToken.id.toString() !== blog.user.toString()) {
            return response.status(400).json({ error: 'only creator can delete a blog' })
        }

        if (blog) {
            await blog.remove()
        }

        response.status(204).end()
    } catch (exception) {
        if (exception.name === 'JsonWebTokenError') {
            response.status(401).json({ error: exception.message })
        } else {
            console.log(exception)
            response.status(500).json({ error: 'something went wrong...' })
        }
    }
})

blogsRouter.post('/', async (request, response) => {
    const { title, author, url, likes } = request.body

    try {
        const token = request.token
        const decodedToken = jwt.verify(token, process.env.SECRET)

        if (!token || !decodedToken.id) {
            return response.status(401).json({ error: 'token missing or invalid' })
        }

        if (title === undefined || url === undefined) {
            return response.status(400).json({ error: 'url or title missing' })
        }

        const user = await User.findById(decodedToken.id)

        const blog = new Blog({ title, author, url, likes: (likes || 0), user: user._id })
        const result = await blog.save()
        result.user = user

        user.blogs = user.blogs.concat(blog._id)
        await user.save()
        response.status(201).json(result)

    } catch (exception) {
        if (exception.name === 'JsonWebTokenError') {
            response.status(401).json({ error: exception.message })
        } else {
            console.log(exception)
            response.status(500).json({ error: 'something went wrong...' })
        }
    }
})

blogsRouter.post('/:id/comments', async (req, res) => {
    try {
        const body = req.body

        const blog = {
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes,
            comments: body.comments
        }

        const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, { new: true }).populate('user')
        res.status(200).json(updatedBlog)
    } catch (exception) {
        console.log(exception)
        res.status(400).json({ error: 'malformatted id' })
    }

})

blogsRouter.put('/:id', async (request, response) => {
    try {
        const body = request.body

        const blog = {
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes === undefined ? 0 : body.likes
        }

        const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true }).populate('user')
        response.json(updatedBlog)

    } catch (exception) {
        console.log(exception)
        response.status(400).json({ error: 'malformatted id' })
    }

})

module.exports = blogsRouter