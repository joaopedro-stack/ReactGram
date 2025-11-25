import './Loading.css'

const Loading = () => {
    return (
        <div className='loading'>
            <svg className='svg' viewBox="25 25 50 50">
                <circle className='circle' r="20" cy="50" cx="50"></circle>
            </svg>
        </div>
    )
}

export default Loading