import React from 'react'
import { shallow } from 'enzyme'
import Blog from './Blog'

describe.only('<Blog />', () => {
    it('renders correctly at first', () => {
        const blog = {
            title: 'testiblogi',
            author: 'Matti',
            likes: 10
        }

        const blogComponent = shallow(<Blog blog={blog}/>)

        const contentDiv = blogComponent.find('.blogContent')

        expect(contentDiv.text()).toContain(blog.title)
        expect(contentDiv.text()).toContain(blog.author)
        expect(contentDiv.text()).not.toContain(blog.likes)
    })

    it('clicking the button toggles visible content', () => {
        const user = {name: 'masa'}
        const blog = {
            title: 'testiblogi',
            author: 'Matti',
            likes: 10,
            user: user
        }
        

        const mockClick = jest.fn()

        const blogComponent = shallow(
            <Blog
                blog={blog}
                onClick={mockClick}
                user={user}
            />
        )        
        const button = blogComponent.find('button')
        button.at(0).simulate('click')
        const contentDiv = blogComponent.find('.togglableContent')

        expect(contentDiv.text()).toContain(blog.likes)
        expect(contentDiv.text()).toContain(blog.user.name)

    })
})