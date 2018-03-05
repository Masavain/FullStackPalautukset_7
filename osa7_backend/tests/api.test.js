const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const { format, initialBlogs, nonExistingId, blogsInDb, usersInDb } = require('./test_helper')

describe('initial blogs', async () => {
    beforeAll(async () => {
        await Blog.remove({})

        const blogObjects = initialBlogs.map(b => new Blog(b))
        await Promise.all(blogObjects.map(b => b.save()))
    })

    test('all blogs are returned as json by GET /api/blogs', async () => {
        const blogsInDatabase = await blogsInDb()

        const response = await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body.length).toBe(blogsInDatabase.length)

        const returnedTitles = response.body.map(p => p.title)
        blogsInDatabase.forEach(blog => {
            expect(returnedTitles).toContain(blog.title)
        })
    })

    test('individual blog is returned as json by GET /api/blogs', async () => {
        const blogsInDatabase = await blogsInDb()
        const aBlog = blogsInDatabase[0]

        const response = await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)


        const returnedTitles = response.body.map(r => r.title)

        expect(returnedTitles).toContain(aBlog.title)
    })

    describe('addition of a new blog', async () => {

        test('POST /api/blogs succeeds with valid data', async () => {
            const blogsAtStart = await blogsInDb()

            const newBlog = {
                title: 'masan musablogi',
                author: 'Matti',
                url: 'asdasd.com',
                likes: 0
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const blogsAfterOperation = await blogsInDb()

            expect(blogsAfterOperation.length).toBe(blogsAtStart.length + 1)

            const titles = blogsAfterOperation.map(r => r.title)
            expect(titles).toContain('masan musablogi')
        })

        test('no likes is valid and can be added by POST /api/blogs', async () => {
            const blogsAtStart = await blogsInDb()

            const newBlog = {
                title: 'masan musablogi',
                author: 'Matti',
                url: 'asdasd.com',
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const blogsAfterOperation = await blogsInDb()
            expect(blogsAfterOperation.length).toBe(blogsAtStart.length + 1)

            const titles = blogsAfterOperation.map(r => r.title)

            expect(titles).toContain('masan musablogi')
        })

        test('blog without title or url fails by POST /api/blogs and proper statuscode', async () => {
            const blogsAtStart = await blogsInDb()

            const newBlog = {
                author: 'Matti',
                url: 'asdasd.com',
                likes: 0
            }

            const newBlog2 = {
                title: 'masan matikkablogi',
                author: 'Matti',
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(400)

            await api
                .post('/api/blogs')
                .send(newBlog2)
                .expect(400)

            const blogsAfterOperation = await blogsInDb()
            expect(blogsAfterOperation.length).toBe(blogsAtStart.length)

            const titles = blogsAfterOperation.map(r => r.title)
            expect(titles).not.toContain('masan matikkablogi')
        })

    })

    describe('deletion of a blog', async () => {
        let addedBlog

        beforeAll(async () => {
            addedBlog = new Blog({
                title: 'Masan poistettava blogi',
                author: 'Matti V',
                url: 'poistoon.com',
            })
            await addedBlog.save()
        })

        test('DELETE /api/blogs/:id succeeds with proper statuscode', async () => {
            const blogsAtStart = await blogsInDb()

            await api
                .delete(`/api/blogs/${addedBlog._id}`)
                .expect(204)

            const blogsAfterOperation = await blogsInDb()

            const titles = blogsAfterOperation.map(r => r.title)

            expect(titles).not.toContain(addedBlog.title)
            expect(blogsAfterOperation.length).toBe(blogsAtStart.length - 1)
        })
    })

    describe.only('updating of a blog', async () => {
        let addedBlog

        beforeAll(async () => {
            addedBlog = new Blog({
                title: 'Masan muutettava blogi',
                author: 'Matti Vee',
                url: 'muutetaan.com',
            })
            await addedBlog.save()
        })

        test('PUT /api/blogs/:id succeeds with proper statuscode', async () => {
            const blogsAtStart = await blogsInDb()

            updatedBlog = new Blog({
                title: 'Masan muutettava blogi 2',
                author: 'Matti Vee',
                url: 'muutetaan.com',
            })

            await api
                .put(`/api/blogs/${addedBlog._id}`)
                .send(updatedBlog)
                .expect(200)

            const blogsAfterOperation = await blogsInDb()
            const titles = blogsAfterOperation.map(r => r.title)

            expect(titles).toContain(updatedBlog.title)
            expect(blogsAfterOperation.length).toBe(blogsAtStart.length)
        })

    })

    describe.only('when there is initially one user at db', async () => {
        beforeAll(async () => {
            await User.remove({})
            const user = new User({ username: 'root', password: 'sekret' })
            await user.save()
        })

        test('POST /api/users succeeds with a fresh username', async () => {
            const usersBeforeOperation = await usersInDb()

            const newUser = {
                username: 'mluukkai',
                name: 'Matti Luukkainen',
                password: 'salainen'
            }

            await api
                .post('/api/users')
                .send(newUser)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const usersAfterOperation = await usersInDb()
            expect(usersAfterOperation.length).toBe(usersBeforeOperation.length + 1)
            const usernames = usersAfterOperation.map(u => u.username)
            expect(usernames).toContain(newUser.username)
        })

        test('POST /api/users fails with proper statuscode and message if username already taken or password too short', async () => {
            const usersBeforeOperation = await usersInDb()

            const newUser = {
                username: 'root',
                name: 'Superuser',
                password: 'salainen'
            }

            const newUser2 = {
                username: 'testi',
                name: 'testi',
                password: 'aa'
            }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            expect(result.body).toEqual({ error: 'username must be unique' })

            const result2 = await api
                .post('/api/users')
                .send(newUser2)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            expect(result2.body).toEqual({ error: 'password too short (must be at least 3 characters long)' })

            const usersAfterOperation = await usersInDb()
            expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
        })

        
    })





})



afterAll(() => {
    server.close()
})