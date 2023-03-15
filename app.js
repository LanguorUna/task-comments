function getDateForInput(date) {
    const year = date.getFullYear().toString().padStart(4, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')

    return `${year}-${month}-${day}`
}

function getRetrospectDateText(date) {
    const timeText = date.toTimeString().substring(0, 5)
    const now = new Date()
    const [day, month, year] = [date.getDate(), date.getMonth(), date.getFullYear()]
    if (day === now.getDate()
        && month === now.getMonth()
        && year === now.getFullYear()
    ) {
        return `сегодня, ${timeText}`
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    if (day === yesterday.getDate()
        && month === yesterday.getMonth()
        && year === yesterday.getFullYear()
    ) {
        return `вчера, ${timeText}`
    }

    const dateText = date.toLocaleDateString()
    return `${dateText}, ${timeText}`
}

function renderComment({id, name, date, text, liked}) {
    const dateText = getRetrospectDateText(date)
    return `    
        <div class="comment">
            <div class="comment__name">${name}</div>
            <div class="comment__time">${dateText}</div>
            <div class="comment__text">${text}</div>
            <div class="comment__actions">
                <div class="comment__like ${liked ? 'comment__like_liked' : ''}" data-id="${id}">❤</div>
                <div class="comment__trash" data-id="${id}">🗑</div>
            </div>
        </div>
    `
}

function refreshComments(commentsElement, comments) {
    commentsElement.innerHTML = comments.length
        ? [...comments].sort((c1, c2) => c2.date - c1.date).map(renderComment).join('')
        : '<span class="comments__empty">Нет комментариев</span>'

    commentsElement.querySelectorAll('.comment__like')
        .forEach((like) => {
            like.addEventListener('click', (e) => {
                const id = e.currentTarget.attributes.getNamedItem('data-id').value
                const isLiked = e.currentTarget.classList.contains('comment__like_liked')

                const model = comments.find((comment) => comment.id === id)
                if (model) {
                    model.liked = !isLiked
                }

                refreshComments(commentsElement, comments)
            })
        })

    commentsElement.querySelectorAll('.comment__trash')
        .forEach((trash) => {
            trash.addEventListener('click', (e) => {
                const id = e.currentTarget.attributes.getNamedItem('data-id').value

                const index = comments.findIndex((comment) => comment.id === id)
                if (index > -1) {
                    comments.splice(index, 1)
                }

                refreshComments(commentsElement, comments)
            })
        })
}

window.onload = () => {
    const commentsElement = document.querySelector('.comments')
    const formElement = document.querySelector('.form')
    //const dateElement = formElement.querySelector('.form__date')
    const textElement = formElement.querySelector('.form__text')

    const comments = []
    refreshComments(commentsElement, comments)


    formElement.addEventListener('submit', (e) => {
        e.preventDefault()
        const formData = new FormData(formElement)

        const date = new Date(formData.get('date') || new Date())
        const now = new Date()
        date.setHours(now.getHours(), now.getMinutes(), now.getSeconds())

        comments.push({
            name: formData.get('name'),
            date,
            text: formData.get('text'),
            id: `${formData.get('name')}-${date.getTime()}`
        })

        textElement.value = ''
        //dateElement.value = getDateForInput(new Date())
        refreshComments(commentsElement, comments)
    })
}