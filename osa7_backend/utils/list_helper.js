const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const reducer = (sum, item) => {
        return sum + item.likes
    }
    return blogs.length === 0 ? 0: blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
    const reducer = (prev, cur) => {
        return (prev.likes > cur.likes) ? prev : cur
    }
    return blogs.reduce(reducer,0)
    
}

const mostBlogs = (blogs) => {
    var max = 0
    var result
    const frequency = {}
    for (let i = 0; i < blogs.length; i++) {
        frequency[blogs[i].author]=frequency[blogs[i].author] === undefined
        ? 1: frequency[blogs[i].author] = frequency[blogs[i].author]+1
        if (frequency[blogs[i].author] > max) {
            max = frequency[blogs[i].author]
            result = blogs[i].author
        }
    }
    return ({"author": result, "blogs": max})
}

const mostLikes = (blogs) => {
    var max = 0
    var result
    const frequency = {}
    for (let i = 0; i < blogs.length; i++) {
        frequency[blogs[i].author]=frequency[blogs[i].author] === undefined
        ? blogs[i].likes: frequency[blogs[i].author] = frequency[blogs[i].author]+blogs[i].likes
        if (frequency[blogs[i].author] > max) {
            max = frequency[blogs[i].author]
            result = blogs[i].author
        }

    }
    return ({"author": result, "votes": max})
}


module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}