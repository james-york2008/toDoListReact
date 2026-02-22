const checkStatus = (response) => {
    if (response.ok) {
        return response
    }
    throw new Error('Request was either a 404 or 500')
}

const json = (response) => response.json()


class Task extends React.Component {
    render() {
        const { task, onDelete, onComplete } = this.props
        const { id, content, completed } = task

        return (
            <div className="row mb-1">
                <p className="col">{content}</p>
                <button onClick={() => onDelete(id)}>Delete</button>
                <input className="d-inline-block mt-2" type="checkbox" onChange={() => onComplete(id, completed)} checked={completed}></input>
            </div>
        )
    }
}

class ToDolist extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            new_task: '',
            tasks: [],
            filter: 'all'
        }

        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.fetchTasks = this.fetchTasks.bind(this)
        this.deleteTask = this.deleteTask.bind(this)
        this.toggleComplete = this.toggleComplete.bind(this)
        this.toggleFilter = this.toggleFilter.bind(this)
    }

    componentDidMount() {
        this.fetchTasks()
    }

    fetchTasks() {
        fetch('https://fewd-todolist-api.onrender.com/tasks?api_key=1') /*Im not sure if this is the right api key but its the one I used on the last toDoList*/
        .then(checkStatus)
        .then(json)
        .then((response) => {
            console.log(response)
            this.setState({tasks: response.tasks})
        })
        .catch(error => {
            console.error(error.message)
        })
    }

    handleChange(event) {
        this.setState({
            new_task: event.target.value
        })
    }

    handleSubmit(event) {
        event.preventDefault()
        let { new_task } = this.state
        new_task = new_task.trim()
        if (!new_task) {
            return
        }

        fetch('https://fewd-todolist-api.onrender.com/tasks?api_key=1', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({ task: {
                content: new_task 
            }})
        }).then(checkStatus)
        .then(json)
        .then((data) => {
            this.setState({new_task: ''})
            this.fetchTasks()
        })
        .catch((error) => {
            this.setState({ error: error.message })
            console.log(error)
        })
    }

    deleteTask(id) {
        if (!id) {
            return
        }

        fetch(`https://fewd-todolist-api.onrender.co/tasks/${id}?api_key=1`, {
            method: 'DELETE',
            mode: 'cors'
        }).then(checkStatus)
        .then(json)
        .then((data) => {
            this.fetchTasks()
        }).catch((error) => {
            this.setState({ error: error.message })
            console.log(error)
        })
    }

    toggleComplete(id, completed) {
        if(!id) {
            return
        }

        const newState = completed ? 'active' : 'complete'

        fetch(`https://fewd-todolist-api.onrender.com/tasks/${id}/mark_${newState}?api_key=1`, {
            method: 'PUT',
            mode: 'cors'
        }).then(checkStatus)
        .then(json)
        .then((data) => {
            this.fetchTasks()
        }).catch((error) => {
            this.setState({ error: error.message })
            console.log(error)
        })
    }

    toggleFilter(e) {
        console.log(e.target.name)
        this.setState({ filter: e.target.name })
    }

    render() {
        const { new_task, tasks, filter } = this.state

        return (
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <h2 className="mb-3">To Do List</h2>
                        {tasks.length > 0 ? tasks.map((task) => {
                            if (filter === 'all') {
                                return true
                            } else if (filter === 'active') {
                                return !task.completed
                            } else {
                                return task.completed
                            }
                        }).map((task) => {
                            return (
                                <Task key={task.id} task={task} onDelete={this.deleteTask} onComplete={this.toggleComplete}></Task>
                            )        
                        }) : <p>no tasks here</p>}
                        <div className="mt-3">
                            <label>
                                <input type="checkbox" name="all" checked={filter === 'all'} onChange={this.toggleFilter}></input>
                                All
                            </label>
                            <label>
                                <input type="checkbox" name="active" checked={filter === 'active'} onChange={this.toggleFilter}></input>
                                Active
                            </label>
                            <label>
                                <input type="checkbox" name="completed" checked={filter === 'completed'} onChange={this.toggleFilter}></input>
                                Completed
                            </label>
                        </div>
                        <form onSubmit={this.handleSubmit} className="form-inline my-4">
                            <input type="text" className="form-control mr-sm-2 mb-2" placeholder="new task" value={new_task} onChange={this.handleChange}></input>
                            <button type="submit" className="btn btn-primary mb-2">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

const container = document.getElementById('root')
const root = ReactDOM.createRoot(container)
root.render(<ToDolist></ToDolist>)