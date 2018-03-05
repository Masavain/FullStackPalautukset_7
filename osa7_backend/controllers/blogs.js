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
    const body = request.body

    try {
        const decodedToken = jwt.verify(request.token, process.env.SECRET)

        if (!decodedToken.id) {
            return response.status(401).json({ error: 'token missing or invalid' })
        }



        if (body.title === undefined || body.author === undefined || body.url === undefined) {
            return response.status(400).json({ error: 'content missing' })
        }
        const user = await User.findById(decodedToken.id)

        const blog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes === undefined ? 0 : body.likes,
            user: user._id
        })
        const savedBlog = await blog.save()

        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()

        response.status(201).json(Blog.format(savedBlog))
    } catch (exception) {
        if (exception.name === 'JsonWebTokenError') {
            response.status(401).json({ error: exception.message })
        } else {
            console.log(exception)
            response.status(500).json({ error: 'something went wrong...' })

        }
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

        const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
        response.json(updatedBlog)

    } catch (exception) {
        console.log(exception)
        response.status(400).json({ error: 'malformatted id' })
    }

})

module.exports = blogsRouter