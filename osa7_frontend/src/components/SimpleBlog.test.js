import React from 'react'
import { shallow } from 'enzyme'
import SimpleBlog from './SimpleBlog'

describe.only('<SimpleBlog />', () => {
    it('renders correctly', () => {
        const blog = {
            title: 'testiblogi',
            author: 'Matti',
            likes: 10
        }

        const blogComponent = shallow(<SimpleBlog blog={blog} />)

        const contentDiv = blogComponent.find('.blogContent')
        const likesDiv = blogComponent.find('.likes')

        expect(contentDiv.text()).toContain(blog.title)
        expect(contentDiv.text()).toContain(blog.author)
        expect(likesDiv.text()).toContain(blog.likes)
    })

    it('clicking the button twice calls event handler twice', () => {
        const blog = {
            title: 'testiblogi',
            author: 'Matti',
            likes: 10
        }

        const mockHandler = jest.fn()
        const blogComponent = shallow(
            <SimpleBlog
                blog={blog}
                onClick={mockHandler}
            />
        )

        const button = blogComponent.find('button')
        button.simulate('click')
        button.simulate('click')

        expect(mockHandler.mock.calls.length).toBe(2)




    })

})
